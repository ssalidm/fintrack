package za.co.pixelly.fintrack.finance.transfer.application;


import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import za.co.pixelly.fintrack.common.api.PageResponse;
import za.co.pixelly.fintrack.finance.account.application.exceptions.AccountNotFoundException;
import za.co.pixelly.fintrack.finance.account.domain.Account;
import za.co.pixelly.fintrack.finance.account.domain.AccountStatus;
import za.co.pixelly.fintrack.finance.account.persistence.AccountRepository;
import za.co.pixelly.fintrack.finance.transaction.persistence.TransferSpecifications;
import za.co.pixelly.fintrack.finance.transfer.api.CreateTransferRequest;
import za.co.pixelly.fintrack.finance.transfer.api.TransferQuery;
import za.co.pixelly.fintrack.finance.transfer.api.TransferResponse;
import za.co.pixelly.fintrack.finance.transfer.api.VoidTransferRequest;
import za.co.pixelly.fintrack.finance.transfer.application.exceptions.InactiveTransferAccountException;
import za.co.pixelly.fintrack.finance.transfer.application.exceptions.TransferAccountCurrencyMismatchException;
import za.co.pixelly.fintrack.finance.transfer.application.exceptions.TransferAlreadyVoidedException;
import za.co.pixelly.fintrack.finance.transfer.application.exceptions.TransferNotFoundException;
import za.co.pixelly.fintrack.finance.transfer.domain.Transfer;
import za.co.pixelly.fintrack.finance.transfer.domain.TransferStatus;
import za.co.pixelly.fintrack.finance.transfer.persistence.TransferCommandRepository;
import za.co.pixelly.fintrack.finance.transfer.persistence.TransferRepository;

import java.util.UUID;

import static za.co.pixelly.fintrack.common.Util.normalizeNullable;


@Service
@RequiredArgsConstructor
public class DefaultTransferService implements TransferService {

    private final TransferRepository transferRepository;
    private final TransferCommandRepository transferCommandRepository;
    private final AccountRepository accountRepository;
    private final EntityManager entityManager;

    @Override
    @Transactional
    public TransferResponse create(UUID userId, CreateTransferRequest request) {
        Account source = findActiveAccount(userId, request.sourceAccountId());
        Account destination = findActiveAccount(userId, request.destinationAccountId());

        if (!source.getCurrencyCode().equals(destination.getCurrencyCode())) {
            throw new TransferAccountCurrencyMismatchException();
        }

        String description = normalizeNullable(request.description());

        UUID transferId = transferCommandRepository.createTransfer(
            userId,
            source.getId(),
            destination.getId(),
            request.amount(),
            request.transactionDate(),
            description
        );

        Transfer transfer = transferRepository.findByIdAndUserId(
            transferId,
            userId
        ).orElseThrow(TransferNotFoundException::new);

        return TransferResponse.from(transfer);
    }


    @Override
    @Transactional(readOnly = true)
    public PageResponse<TransferResponse> findTransfers(UUID userId, TransferQuery query) {
        Pageable pageable = PageRequest.of(
            query.getPage(),
            query.getSize(),
            Sort.by(
                Sort.Order.desc("transactionDate"),
                Sort.Order.desc("createdAt"),
                Sort.Order.desc("id")
            )
        );

        Page<TransferResponse> page = transferRepository.findAll(
                TransferSpecifications.from(
                    userId,
                    query
                ),
                pageable
            )
            .map(TransferResponse::from
            );

        return PageResponse.from(page);
    }


    @Override
    @Transactional(readOnly = true)
    public TransferResponse findById(UUID userId, UUID transferId) {
        Transfer transfer = transferRepository.findByIdAndUserId(transferId, userId)
            .orElseThrow(TransferNotFoundException::new);

        return TransferResponse.from(transfer);
    }


    @Override
    @Transactional
    public TransferResponse voidTransfer(UUID userId, UUID transferId, VoidTransferRequest request) {
        Transfer transfer = transferRepository.findByIdAndUserId(
                transferId,
                userId
            )
            .orElseThrow(TransferNotFoundException::new
            );

        if (transfer.getStatus() == TransferStatus.VOIDED) {
            throw new TransferAlreadyVoidedException();
        }

        transferCommandRepository.voidTransfer(
            userId,
            transferId,
            request.reason().trim()
        );

        /*
         * The database function changed this row
         * outside Hibernate's normal dirty chacking.
         *
         * Refresh the managed entity so the response
         * reflects the new database state.
         */
        entityManager.refresh(transfer);

        return TransferResponse.from(transfer);
    }


    /*
     ***************************************************************
     * HELPER METHODS
     ***************************************************************
     */

    private Account findActiveAccount(UUID userId, UUID accountId) {
        Account account = accountRepository.findByIdAndUserId(accountId, userId)
            .orElseThrow(AccountNotFoundException::new);

        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new InactiveTransferAccountException();
        }

        return account;
    }
}
