package za.co.pixelly.fintrack.finance.goal.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(
    name = "goal_contributions",
    schema = "finance"
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class GoalContribution {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "goal_id", nullable = false)
    private UUID goalId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(
        name = "amount",
        nullable = false,
        precision = 19,
        scale = 4
    )
    private BigDecimal amount;

    @Column(name = "contribution_date", nullable = false)
    private LocalDate contributionDate;

    @Column(name = "note", length = 500)
    private String note;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 16)
    private GoalContributionStatus status;

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


    public static GoalContribution create(
        UUID goalId,
        UUID userId,
        BigDecimal amount,
        LocalDate contributionDate,
        String note,
        Instant now
    ) {
        GoalContribution contribution =
            new GoalContribution();

        contribution.goalId = goalId;
        contribution.userId = userId;
        contribution.amount = amount;

        contribution.contributionDate = contributionDate;

        contribution.note = normalizeNullable(note);

        contribution.status = GoalContributionStatus.POSTED;

        contribution.voidedAt = null;
        contribution.voidReason = null;

        contribution.createdAt = now;
        contribution.updatedAt = now;

        return contribution;
    }


    public void update(
        BigDecimal amount,
        LocalDate contributionDate,
        String note,
        Instant now
    ) {
        if (amount != null) {
            this.amount = amount;
        }

        if (contributionDate != null) {
            this.contributionDate = contributionDate;
        }

        if (note != null) {
            this.note = normalizeNullable(note);
        }

        this.updatedAt = now;
    }


    public void voidContribution(
        String reason,
        Instant now
    ) {
        this.status = GoalContributionStatus.VOIDED;

        this.voidedAt = now;
        this.voidReason = reason.trim();
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
