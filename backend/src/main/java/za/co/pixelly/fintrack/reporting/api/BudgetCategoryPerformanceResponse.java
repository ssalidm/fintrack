package za.co.pixelly.fintrack.reporting.api;

import java.math.BigDecimal;
import java.util.UUID;

public record BudgetCategoryPerformanceResponse(

    UUID budgetLimitId,
    UUID categoryId,
    String categoryName,
    BigDecimal limitAmount,
    BigDecimal spentAmount,
    BigDecimal remainingAmount,
    BigDecimal utilizationPercentage,
    boolean exceeded

) {
}
