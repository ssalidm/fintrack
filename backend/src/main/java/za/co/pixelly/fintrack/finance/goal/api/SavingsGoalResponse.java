package za.co.pixelly.fintrack.finance.goal.api;

import za.co.pixelly.fintrack.finance.goal.domain.SavingsGoal;
import za.co.pixelly.fintrack.finance.goal.domain.SavingsGoalStatus;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record SavingsGoalResponse(

    UUID id,
    String name,
    String description,
    String currencyCode,
    BigDecimal targetAmount,
    BigDecimal currentAmount,
    BigDecimal remainingAmount,
    BigDecimal progressPercentage,
    LocalDate targetDate,
    SavingsGoalStatus status,
    Instant completedAt,
    Instant archivedAt,
    Instant createdAt,
    Instant updatedAt,
    long version

) {

    public static SavingsGoalResponse from(
        SavingsGoal goal,
        BigDecimal currentAmount
    ) {
        BigDecimal current = currentAmount == null
            ? BigDecimal.ZERO
            : currentAmount;

        BigDecimal remaining = goal
            .getTargetAmount()
            .subtract(current)
            .max(BigDecimal.ZERO);

        BigDecimal percentage = current
            .divide(
                goal.getTargetAmount(),
                4,
                RoundingMode.HALF_UP
            )
            .multiply(
                BigDecimal.valueOf(100)
            )
            .setScale(
                2,
                RoundingMode.HALF_UP
            );

        return new SavingsGoalResponse(
            goal.getId(),
            goal.getName(),
            goal.getDescription(),
            goal.getCurrencyCode(),
            goal.getTargetAmount(),
            current,
            remaining,
            percentage,
            goal.getTargetDate(),
            goal.getStatus(),
            goal.getCompletedAt(),
            goal.getArchivedAt(),
            goal.getCreatedAt(),
            goal.getUpdatedAt(),
            goal.getVersion()
        );
    }
}
