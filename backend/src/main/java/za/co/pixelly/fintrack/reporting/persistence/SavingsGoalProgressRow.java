package za.co.pixelly.fintrack.reporting.persistence;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record SavingsGoalProgressRow(
    UUID goalId,
    String goalName,
    String description,
    String currencyCode,
    BigDecimal targetAmount,
    BigDecimal contributedAmount,
    BigDecimal remainingAmount,
    BigDecimal progressPercentage,
    boolean targetReached,
    LocalDate targetDate,
    Integer daysRemaining,
    long contributionCount,
    String status,
    Instant completedAt,
    Instant archivedAt,
    Instant createdAt,
    Instant updatedAt
) {
}
