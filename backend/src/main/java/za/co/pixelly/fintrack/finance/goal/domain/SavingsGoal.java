package za.co.pixelly.fintrack.finance.goal.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Locale;
import java.util.UUID;

@Entity
@Table(
    name = "savings_goals",
    schema = "finance"
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SavingsGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "currency_code", nullable = false, length = 3)
    private String currencyCode;

    @Column(
        name = "target_amount",
        nullable = false,
        precision = 19,
        scale = 4
    )
    private BigDecimal targetAmount;

    @Column(name = "target_date")
    private LocalDate targetDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 16)
    private SavingsGoalStatus status;

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


    public static SavingsGoal create(
        UUID userId,
        String name,
        String description,
        String currencyCode,
        BigDecimal targetAmount,
        LocalDate targetDate,
        Instant now
    ) {
        SavingsGoal goal = new SavingsGoal();

        goal.userId = userId;
        goal.name = name.trim();
        goal.description = normalizeNullable(description);

        goal.currencyCode = currencyCode
            .trim()
            .toUpperCase(Locale.ROOT);

        goal.targetAmount = targetAmount;
        goal.targetDate = targetDate;

        goal.status = SavingsGoalStatus.ACTIVE;

        goal.completedAt = null;
        goal.archivedAt = null;

        goal.createdAt = now;
        goal.updatedAt = now;

        return goal;
    }


    public void update(
        String name,
        String description,
        BigDecimal targetAmount,
        LocalDate targetDate,
        boolean clearTargetDate,
        Instant now
    ) {
        if (name != null) {
            this.name = name.trim();
        }

        if (description != null) {
            this.description = normalizeNullable(description);
        }

        if (targetAmount != null) {
            this.targetAmount = targetAmount;
        }

        if (clearTargetDate) {
            this.targetDate = null;

        } else if (targetDate != null) {
            this.targetDate = targetDate;
        }

        this.updatedAt = now;
    }


    public void complete(
        Instant now
    ) {
        this.status = SavingsGoalStatus.COMPLETED;

        this.completedAt = now;
        this.archivedAt = null;
        this.updatedAt = now;
    }


    public void archive(
        Instant now
    ) {
        this.status = SavingsGoalStatus.ARCHIVED;

        this.archivedAt = now;
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
