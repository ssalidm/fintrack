package za.co.pixelly.fintrack.finance.budget.api;

import za.co.pixelly.fintrack.finance.budget.domain.Budget;
import za.co.pixelly.fintrack.finance.budget.domain.BudgetStatus;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record BudgetSummaryResponse(

    UUID id,
    String name,
    LocalDate budgetMonth,
    String currencyCode,
    BudgetStatus status,
    Instant archivedAt,
    Instant createdAt,
    Instant updatedAt,
    long version

) {

    public static BudgetSummaryResponse from(
        Budget budget
    ) {
        return new BudgetSummaryResponse(
            budget.getId(),
            budget.getName(),
            budget.getBudgetMonth(),
            budget.getCurrencyCode(),
            budget.getStatus(),
            budget.getArchivedAt(),
            budget.getCreatedAt(),
            budget.getUpdatedAt(),
            budget.getVersion()
        );
    }
}
