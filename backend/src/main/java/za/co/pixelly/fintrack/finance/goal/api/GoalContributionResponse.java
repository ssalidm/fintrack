package za.co.pixelly.fintrack.finance.goal.api;

import za.co.pixelly.fintrack.finance.goal.domain.GoalContribution;
import za.co.pixelly.fintrack.finance.goal.domain.GoalContributionStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record GoalContributionResponse(

    UUID id,
    UUID goalId,
    BigDecimal amount,
    LocalDate contributionDate,
    String note,
    GoalContributionStatus status,
    Instant voidedAt,
    String voidReason,
    Instant createdAt,
    Instant updatedAt,
    long version

) {

    public static GoalContributionResponse from(
        GoalContribution contribution
    ) {
        return new GoalContributionResponse(
            contribution.getId(),
            contribution.getGoalId(),
            contribution.getAmount(),
            contribution.getContributionDate(),
            contribution.getNote(),
            contribution.getStatus(),
            contribution.getVoidedAt(),
            contribution.getVoidReason(),
            contribution.getCreatedAt(),
            contribution.getUpdatedAt(),
            contribution.getVersion()
        );
    }
}
