package za.co.pixelly.fintrack.finance.recurring.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import za.co.pixelly.fintrack.finance.transaction.domain.Transaction;
import za.co.pixelly.fintrack.finance.transaction.domain.TransactionStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(
    name = "recurring_transactions",
    schema = "finance"
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RecurringTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "account_id", nullable = false)
    private UUID accountId;

    @Column(name = "category_id", nullable = false)
    private UUID categoryId;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false, length = 20)
    private RecurringTransactionType transactionType;

    @Column(name = "amount", nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "merchant_name", length = 200)
    private String merchantName;

    @Enumerated(EnumType.STRING)
    @Column(name = "frequency", nullable = false, length = 16)
    private RecurringFrequency frequency;

    @Column(name = "interval_count", nullable = false)
    private short intervalCount;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "next_due_date")
    private LocalDate nextDueDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "last_generated_date")
    private LocalDate lastGeneratedDate;

    @Column(name = "auto_post", nullable = false)
    private boolean autoPost;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 16)
    private RecurringTransactionStatus status;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "archived_at")
    private Instant archivedAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Version
    @Column(name = "version", nullable = false)
    private long version;


    public static RecurringTransaction create(
        UUID userId,
        UUID accountId,
        UUID categoryId,
        String name,
        RecurringTransactionType transactionType,
        BigDecimal amount,
        String description,
        String merchantName,
        RecurringFrequency frequency,
        short intervalCount,
        LocalDate startDate,
        LocalDate initialNextDueDate,
        LocalDate endDate,
        boolean autoPost,
        Instant now
    ) {
        RecurringTransaction schedule = new RecurringTransaction();

        schedule.userId = userId;
        schedule.accountId = accountId;
        schedule.categoryId = categoryId;

        schedule.name = name.trim();

        schedule.transactionType = transactionType;

        schedule.amount = amount;

        schedule.description = normalizeNullable(description);

        schedule.merchantName = normalizeNullable(merchantName);

        schedule.frequency = frequency;
        schedule.intervalCount = intervalCount;

        schedule.startDate = startDate;
        schedule.nextDueDate = initialNextDueDate;
        schedule.endDate = endDate;

        schedule.lastGeneratedDate = null;

        schedule.autoPost = autoPost;

        schedule.status = RecurringTransactionStatus.ACTIVE;

        schedule.completedAt = null;
        schedule.archivedAt = null;

        schedule.createdAt = now;
        schedule.updatedAt = now;

        return schedule;
    }


    public void updateDefinition(
        UUID accountId,
        UUID categoryId,
        String name,
        RecurringTransactionType transactionType,
        BigDecimal amount,
        String description,
        String merchantName,
        RecurringFrequency frequency,
        short intervalCount,
        LocalDate endDate,
        boolean autoPost,
        Instant now
    ) {
        this.accountId = accountId;
        this.categoryId = categoryId;
        this.name = name.trim();

        this.transactionType = transactionType;

        this.amount = amount;

        this.description = normalizeNullable(description);

        this.merchantName = normalizeNullable(merchantName);

        this.frequency = frequency;
        this.intervalCount = intervalCount;
        this.endDate = endDate;
        this.autoPost = autoPost;

        this.updatedAt = now;
    }


    public void pause(
        Instant now
    ) {
        this.status = RecurringTransactionStatus.PAUSED;

        this.updatedAt = now;
    }


    public void resume(
        Instant now
    ) {
        this.status = RecurringTransactionStatus.ACTIVE;

        this.updatedAt = now;
    }


    public void archive(
        Instant now
    ) {
        this.status = RecurringTransactionStatus.ARCHIVED;

        this.archivedAt = now;
        this.updatedAt = now;
    }


    public void markGenerated(
        LocalDate generatedDate,
        LocalDate nextDueDate,
        Instant now
    ) {
        this.lastGeneratedDate = generatedDate;

        this.nextDueDate = nextDueDate;

        if (nextDueDate == null) {

            this.status = RecurringTransactionStatus.COMPLETED;

            this.completedAt = now;
        }

        this.updatedAt = now;
    }


    private static String normalizeNullable(
        String value
    ) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();

        return trimmed.isEmpty()
            ? null
            : trimmed;
    }
}
