package za.co.pixelly.fintrack.finance.transaction.application;

import za.co.pixelly.fintrack.common.api.PageResponse;
import za.co.pixelly.fintrack.finance.transaction.api.*;

import java.util.UUID;

public interface TransactionService {

    TransactionResponse create(
        UUID userId,
        CreateTransactionRequest request
    );

    PageResponse<TransactionResponse> findTransactions(
        UUID userId,
        TransactionQuery query
    );

    TransactionResponse findById(
        UUID userId,
        UUID transactionId
    );

    TransactionResponse update(
        UUID userId,
        UUID transactionId,
        UpdateTransactionRequest request
    );

    TransactionResponse voidTransaction(
        UUID userId,
        UUID transactionId,
        VoidTransactionRequest request
    );
}
