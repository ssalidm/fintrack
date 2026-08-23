package za.co.pixelly.fintrack.finance.transaction.api;

import za.co.pixelly.fintrack.finance.transaction.domain.Transaction;
import za.co.pixelly.fintrack.finance.transaction.domain.TransactionStatus;
import za.co.pixelly.fintrack.finance.transaction.domain.TransactionType;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record TransactionResponse(
    UUID id,
    UUID accountId,
    UUID categoryId,
    UUID transferId,
    TransactionType transactionType,
    BigDecimal amount,
    LocalDate transactionDate,
    String description,
    String merchantName,
    TransactionStatus status,
    Instant voidedAt,
    String voidReason,
    UUID recurringTransactionId,
    LocalDate recurrenceDueDate,
    Instant createdAt,
    Instant updatedAt,
    long version
) {

    public static TransactionResponse from(
        Transaction transaction
    ) {
        return new TransactionResponse(
            transaction.getId(),
            transaction.getAccountId(),
            transaction.getCategoryId(),
            transaction.getTransferId(),
            transaction.getTransactionType(),
            transaction.getAmount(),
            transaction.getTransactionDate(),
            transaction.getDescription(),
            transaction.getMerchantName(),
            transaction.getStatus(),
            transaction.getVoidedAt(),
            transaction.getVoidReason(),
            transaction.getRecurringTransactionId(),
            transaction.getRecurrenceDueDate(),
            transaction.getCreatedAt(),
            transaction.getUpdatedAt(),
            transaction.getVersion()
        );
    }
}
