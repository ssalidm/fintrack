package za.co.pixelly.fintrack.reporting.persistence;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record BudgetPerformanceRow(

    UUID budgetId,
    String budgetName,
    LocalDate budgetMonth,
    String currencyCode,
    String budgetStatus,

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
