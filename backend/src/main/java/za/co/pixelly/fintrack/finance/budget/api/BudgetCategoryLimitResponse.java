package za.co.pixelly.fintrack.finance.budget.api;

import za.co.pixelly.fintrack.finance.budget.domain.BudgetCategoryLimit;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record BudgetCategoryLimitResponse(

    UUID id,
    UUID categoryId,
    BigDecimal limitAmount,
    Instant createdAt,
    Instant updatedAt,
    long version

) {

    public static BudgetCategoryLimitResponse from(
        BudgetCategoryLimit limit
    ) {
        return new BudgetCategoryLimitResponse(
            limit.getId(),
            limit.getCategoryId(),
            limit.getLimitAmount(),
            limit.getCreatedAt(),
            limit.getUpdatedAt(),
            limit.getVersion()
        );
    }
}
