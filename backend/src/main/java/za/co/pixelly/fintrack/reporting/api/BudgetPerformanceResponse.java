package za.co.pixelly.fintrack.reporting.api;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record BudgetPerformanceResponse(

    UUID budgetId,
    String budgetName,
    LocalDate budgetMonth,
    String currencyCode,
    String status,

    BigDecimal totalLimitAmount,
    BigDecimal totalSpentAmount,
    BigDecimal totalRemainingAmount,
    BigDecimal utilizationPercentage,

    boolean anyCategoryExceeded,

    List<BudgetCategoryPerformanceResponse> categories

) {
}
