package za.co.pixelly.fintrack.finance.transaction.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "transactions", schema = "finance")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "account_id", nullable = false)
    private UUID accountId;

    @Column(name = "category_id")
    private UUID categoryId;

    @Column(name = "transfer_id")
    private UUID transferId;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false, length = 20)
    private TransactionType transactionType;

    @Column(name = "amount", nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Column(name = "transaction_date", nullable = false)
    private LocalDate transactionDate;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "merchant_name", length = 200)
    private String merchantName;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 16)
    private TransactionStatus status;

    @Column(name = "voided_at")
    private Instant voidedAt;

    @Column(name = "void_reason", length = 255)
    private String voidReason;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Version
    @Column(name = "version", nullable = false)
    private long version;

    @Column(name = "recurring_transaction_id")
    private UUID recurringTransactionId;

    @Column(name = "recurrence_due_date")
    private LocalDate recurrenceDueDate;

    public static Transaction createTransaction(
        UUID userId,
        UUID accountId,
        UUID categoryId,
        UUID recurringTransactionId,
        LocalDate recurrenceDueDate,
        TransactionType transactionType,
        BigDecimal amount,
        LocalDate transactionDate,
        String description,
        String merchantName,
        Instant now
    ) {
        Transaction transaction = new Transaction();

        transaction.userId = userId;
        transaction.accountId = accountId;
        transaction.categoryId = categoryId;
        transaction.transferId = null;
        transaction.transactionType = transactionType;
        transaction.amount = amount;
        transaction.transactionDate = transactionDate;
        transaction.description = description;
        transaction.merchantName = merchantName;
        transaction.status = TransactionStatus.POSTED;
        transaction.voidedAt = null;
        transaction.voidReason = null;
        transaction.createdAt = now;
        transaction.updatedAt = now;
        transaction.recurringTransactionId = recurringTransactionId;
        transaction.recurrenceDueDate = recurrenceDueDate;

        return transaction;
    }

    public void updateTransaction(
        UUID accountId,
        UUID categoryId,
        TransactionType transactionType,
        BigDecimal amount,
        LocalDate transactionDate,
        String description,
        String merchantName,
        Instant now
    ) {
        if (accountId != null) {
            this.accountId = accountId;
        }

        if (categoryId != null) {
            this.categoryId = categoryId;
        }

        if (transactionType != null) {
            this.transactionType = transactionType;
        }

        if (amount != null) {
            this.amount = amount;
        }

        if (transactionDate != null) {
            this.transactionDate = transactionDate;
        }

        if (description != null) {
            this.description = normalizeNullable(description);
        }

        if (merchantName != null) {
            this.merchantName = normalizeNullable(merchantName);
        }

        this.updatedAt = now;
    }


    public void voidTransaction(
        String reason,
        Instant now
    ) {
        this.status =
            TransactionStatus.VOIDED;

        this.voidedAt = now;

        this.voidReason =
            reason.trim();

        this.updatedAt = now;
    }

    private static String normalizeNullable(
        String value
    ) {
        if (value == null) {
            return null;
        }

        String trimmed =
            value.trim();

        return trimmed.isEmpty()
            ? null
            : trimmed;
    }
}
