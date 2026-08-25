package za.co.pixelly.fintrack.finance.budget.api;

import za.co.pixelly.fintrack.finance.budget.domain.Budget;
import za.co.pixelly.fintrack.finance.budget.domain.BudgetCategoryLimit;
import za.co.pixelly.fintrack.finance.budget.domain.BudgetStatus;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record BudgetResponse(

    UUID id,
    String name,
    LocalDate budgetMonth,
    String currencyCode,
    BudgetStatus status,
    Instant archivedAt,
    List<BudgetCategoryLimitResponse> limits,
    Instant createdAt,
    Instant updatedAt,
    long version

) {

    public static BudgetResponse from(
        Budget budget,
        List<BudgetCategoryLimit> limits
    ) {
        return new BudgetResponse(
            budget.getId(),
            budget.getName(),
            budget.getBudgetMonth(),
            budget.getCurrencyCode(),
            budget.getStatus(),
            budget.getArchivedAt(),
            limits.stream()
                .map(BudgetCategoryLimitResponse::from)
                .toList(),
            budget.getCreatedAt(),
            budget.getUpdatedAt(),
            budget.getVersion()
        );
    }
}
