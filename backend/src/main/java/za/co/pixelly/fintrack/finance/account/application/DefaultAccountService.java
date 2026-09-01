package za.co.pixelly.fintrack.finance.account.application;

import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import za.co.pixelly.fintrack.finance.account.api.AccountResponse;
import za.co.pixelly.fintrack.finance.account.api.ArchiveAccountRequest;
import za.co.pixelly.fintrack.finance.account.api.CreateAccountRequest;
import za.co.pixelly.fintrack.finance.account.api.UpdateAccountRequest;
import za.co.pixelly.fintrack.finance.account.application.exceptions.*;
import za.co.pixelly.fintrack.finance.account.domain.Account;
import za.co.pixelly.fintrack.finance.account.domain.AccountStatus;
import za.co.pixelly.fintrack.finance.account.persistence.AccountRepository;
import za.co.pixelly.fintrack.finance.currency.application.InvalidCurrencyException;
import za.co.pixelly.fintrack.finance.currency.persistence.CurrencyRepository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DefaultAccountService implements AccountService {

    private final AccountRepository accountRepository;
    private final CurrencyRepository currencyRepository;

    @Override
    @Transactional
    public AccountResponse create(
        UUID userId,
        CreateAccountRequest request
    ) {
        String name = request.name().trim();
        String currencyCode =
            request.currencyCode().trim().toUpperCase(Locale.ROOT);

        validateCurrency(currencyCode);

        if (accountRepository.existsByNormalizedName(
            userId,
            name,
            AccountStatus.ACTIVE
        )) {
            throw new DuplicateAccountNameException();
        }

        BigDecimal openingBalance =
            request.openingBalance() == null
                ? BigDecimal.ZERO
                : request.openingBalance();

        boolean includeInNetWorth =
            request.includeInNetWorth() == null
                || request.includeInNetWorth();

        Account account =
            Account.create(
                userId,
                name,
                request.accountType(),
                currencyCode,
                openingBalance,
                includeInNetWorth,
                Instant.now()
            );

        try {
            return AccountResponse.from(
                accountRepository.saveAndFlush(account)
            );
        } catch (DataIntegrityViolationException exception) {

            /*
             * The database unique index remains the final
             * concurrency authority.
             */
            if (accountRepository.existsByNormalizedName(
                userId,
                name,
                AccountStatus.ACTIVE
            )) {
                throw new DuplicateAccountNameException();
            }
            throw exception;
        }
    }


    @Override
    @Transactional(readOnly = true)
    public List<AccountResponse> findAccounts(
        UUID userId,
        AccountStatus status
    ) {
        return accountRepository
            .findAllByUserIdAndStatusOrderByCreatedAtDesc(
                userId,
                status
            )
            .stream()
            .map(AccountResponse::from)
            .toList();
    }


    @Override
    @Transactional(readOnly = true)
    public AccountResponse findById(
        UUID userId,
        UUID accountId
    ) {
        Account account =
            accountRepository.findByIdAndUserId(
                    accountId,
                    userId
                )
                .orElseThrow(
                    AccountNotFoundException::new
                );

        return AccountResponse.from(account);
    }

    @Override
    @Transactional
    public AccountResponse update(
        UUID userId,
        UUID accountId,
        UpdateAccountRequest request
    ) {
        Account account =
            findOwnedAccount(
                userId,
                accountId
            );

        if (account.getStatus() == AccountStatus.ARCHIVED) {
            throw new ArchivedAccountModificationException();
        }

        validateVersion(account, request.version());

        String normalizedName = null;

        if (request.name() != null) {
            normalizedName = request.name().trim();

            if (accountRepository.existsByNormalizedNameExcludingAccount(
                userId,
                accountId,
                normalizedName,
                AccountStatus.ACTIVE
            )) {
                throw new DuplicateAccountNameException();
            }
        }

        account.update(
            normalizedName,
            request.accountType(),
            request.openingBalance(),
            request.includeInNetWorth(),
            Instant.now()
        );

        Account saved = accountRepository.saveAndFlush(account);

        return AccountResponse.from(saved);
    }

    @Override
    @Transactional
    public AccountResponse archive(
        UUID userId,
        UUID accountId,
        ArchiveAccountRequest request
    ) {
        Account account =
            findOwnedAccount(
                userId,
                accountId
            );

        if (account.getStatus() == AccountStatus.ARCHIVED) {
            throw new AccountAlreadyArchivedException();
        }

        validateVersion(
            account,
            request.version()
        );

        account.archive(Instant.now());

        Account saved =
            accountRepository.saveAndFlush(account);

        return AccountResponse.from(saved);
    }


    // =======================================================================
    // Helper Methods
    // =======================================================================

    private void validateCurrency(String currencyCode) {
        currencyRepository
            .findByCodeAndActiveTrue(currencyCode)
            .orElseThrow(
                () -> new InvalidCurrencyException(
                    currencyCode
                )
            );
    }

    private Account findOwnedAccount(
        UUID userId,
        UUID accountId
    ) {
        return accountRepository
            .findByIdAndUserId(
                accountId,
                userId
            )
            .orElseThrow(AccountNotFoundException::new);
    }

    private void validateVersion(
        Account account,
        Long requestedVersion
    ) {
        if (account.getVersion() != requestedVersion) {
            throw new StaleAccountVersionException();
        }
    }
}
