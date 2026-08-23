package za.co.pixelly.fintrack.finance.transaction.application;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import za.co.pixelly.fintrack.common.api.PageResponse;
import za.co.pixelly.fintrack.finance.account.application.AccountNotFoundException;
import za.co.pixelly.fintrack.finance.account.domain.Account;
import za.co.pixelly.fintrack.finance.account.domain.AccountStatus;
import za.co.pixelly.fintrack.finance.account.persistence.AccountRepository;
import za.co.pixelly.fintrack.finance.category.application.CategoryNotFoundException;
import za.co.pixelly.fintrack.finance.category.domain.Category;
import za.co.pixelly.fintrack.finance.category.domain.CategoryStatus;
import za.co.pixelly.fintrack.finance.category.domain.CategoryType;
import za.co.pixelly.fintrack.finance.category.persistence.CategoryRepository;
import za.co.pixelly.fintrack.finance.transaction.api.*;
import za.co.pixelly.fintrack.finance.transaction.domain.Transaction;
import za.co.pixelly.fintrack.finance.transaction.domain.TransactionStatus;
import za.co.pixelly.fintrack.finance.transaction.domain.TransactionType;
import za.co.pixelly.fintrack.finance.transaction.persistence.TransactionRepository;
import za.co.pixelly.fintrack.finance.transaction.persistence.TransactionSpecifications;

import java.time.Instant;
import java.util.UUID;

import static za.co.pixelly.fintrack.common.Util.normalizeNullable;

@Service
@RequiredArgsConstructor
public class DefaultTransactionService implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;


    @Override
    @Transactional
    public TransactionResponse create(UUID userId, CreateTransactionRequest request) {
        Account account = findActiveAccount(userId, request.accountId());

        Category category = findActiveCategory(userId, request.categoryId());

        TransactionType transactionType = request.transactionType().toDomain();

        validateCategoryType(transactionType, category);

        Instant now = Instant.now();

        Transaction transaction = Transaction.createManual(
            userId,
            account.getId(),
            category.getId(),
            transactionType,
            request.amount(),
            request.transactionDate(),
            normalizeNullable(request.description()),
            normalizeNullable(request.merchantName()),
            now
        );

        return TransactionResponse.from(
            transactionRepository
                .saveAndFlush(transaction)
        );
    }


    @Override
    @Transactional(readOnly = true)
    public PageResponse<TransactionResponse> findTransactions(UUID userId, TransactionQuery query) {
        Pageable pageable = PageRequest.of(
            query.getPage(),
            query.getSize(),
            Sort.by(
                Sort.Order.desc("transactionDate"),
                Sort.Order.desc("CreatedAt"),
                Sort.Order.desc("id")
            )
        );

        Page<TransactionResponse> page = transactionRepository
            .findAll(
                TransactionSpecifications
                    .from(userId, query),
                pageable)
            .map(TransactionResponse::from
            );

        return PageResponse.from(page);
    }


    @Override
    @Transactional(readOnly = true)
    public TransactionResponse findById(UUID userId, UUID transactionId) {
        Transaction transaction = transactionRepository
            .findByIdAndUserId(transactionId, userId)
            .orElseThrow(TransactionNotFoundException::new
            );

        return TransactionResponse.from(transaction);
    }


    @Override
    @Transactional
    public TransactionResponse update(
        UUID userId,
        UUID transactionId,
        UpdateTransactionRequest request
    ) {
        Transaction transaction = findOwnedTransaction(
            userId, transactionId
        );

        ensureManualTransaction(transaction);
        ensurePosted(transaction);
        validateVersion(transaction, request.version());

        UUID targetAccountId = request.accountId() == null
            ? transaction.getAccountId()
            : request.accountId();

        UUID targetCategoryId = request.categoryId() == null
            ? transaction.getCategoryId()
            : request.categoryId();

        TransactionType targetType = request.transactionType() == null
            ? transaction.getTransactionType()
            : request.transactionType().toDomain();

        /*
         * Only require the account to still be ACTIVE
         * when the user is actually moving the
         * transaction to another account
         *
         * Historical transactions may legitimately
         * reference an account that has been archived.
         */
        if (request.accountId() != null) {
            findActiveAccount(userId, targetAccountId);
        }

        Category targetCategory;

        if (request.categoryId() != null) {
            targetCategory = findActiveCategory(userId, targetCategoryId);
        } else {
            targetCategory = categoryRepository.findByIdAndUserId(
                    targetCategoryId,
                    userId
                )
                .orElseThrow(CategoryNotFoundException::new);
        }

        validateCategoryType(targetType, targetCategory);

        transaction.updateManual(
            request.accountId(),
            request.categoryId(),
            request.transactionType() == null
                ? null
                : request.transactionType().toDomain(),
            request.amount(),
            request.transactionDate(),
            request.description(),
            request.merchantName(),
            Instant.now()
        );

        return TransactionResponse.from(
            transactionRepository.saveAndFlush(transaction)
        );
    }


    @Override
    @Transactional
    public TransactionResponse voidTransaction(
        UUID userId,
        UUID transactionId,
        VoidTransactionRequest request
    ) {
        Transaction transaction = findOwnedTransaction(
            userId, transactionId
        );

        ensureManualTransaction(transaction);

        if (transaction.getStatus() == TransactionStatus.VOIDED) {
            throw new TransactionAlreadyVoidedException();
        }

        validateVersion(transaction, request.version());

        transaction.voidTransaction(
            request.reason(),
            Instant.now()
        );

        return TransactionResponse.from(
            transactionRepository.saveAndFlush(transaction)
        );
    }


    /*
     ***************************************************************
     * HELPER METHODS
     ***************************************************************
     */
    private Account findActiveAccount(
        UUID userId,
        UUID accountId
    ) {
        Account account = accountRepository
            .findByIdAndUserId(accountId, userId)
            .orElseThrow(AccountNotFoundException::new);

        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new InactiveTransactionCategoryException();
        }

        return account;
    }

    private Category findActiveCategory(
        UUID userId,
        UUID categoryId
    ) {
        Category category = categoryRepository
            .findByIdAndUserId(categoryId, userId)
            .orElseThrow(CategoryNotFoundException::new);

        if (category.getStatus() != CategoryStatus.ACTIVE) {
            throw new InactiveTransactionCategoryException();
        }

        return category;
    }

    private void validateCategoryType(
        TransactionType transactionType,
        Category category
    ) {
        CategoryType requiredType =
            switch (transactionType) {
                case INCOME -> CategoryType.INCOME;
                case EXPENSE -> CategoryType.EXPENSE;
                default -> throw new IllegalArgumentException(
                    "Direct transaction creation only supports income and expense"
                );
            };

        if (category.getCategoryType() != requiredType) {
            throw new TransactionCategoryTypeMismatchException();
        }
    }

    private Transaction findOwnedTransaction(
        UUID userId,
        UUID transactionId
    ) {
        return transactionRepository
            .findByIdAndUserId(transactionId, userId)
            .orElseThrow(TransactionNotFoundException::new);
    }

    private void validateVersion(
        Transaction transaction,
        Long requestedVersion
    ) {
        if (transaction.getVersion() != requestedVersion) {
            throw new StaleTransactionVersionException();
        }
    }

    private void ensurePosted(
        Transaction transaction
    ) {
        if (transaction.getStatus() == TransactionStatus.VOIDED) {
            throw new VoidedTransactionModificationException();
        }
    }

    private void ensureManualTransaction(
        Transaction transaction
    ) {
        if (transaction.getTransferId() != null) {
            throw new TransferTransactionModificationException();
        }
    }
}
