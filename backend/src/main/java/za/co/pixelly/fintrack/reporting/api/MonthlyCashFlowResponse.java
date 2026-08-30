package za.co.pixelly.fintrack.reporting.api;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MonthlyCashFlowResponse(

    String currencyCode,
    LocalDate monthStart,
    BigDecimal totalIncome,
    BigDecimal totalExpenses,
    BigDecimal netCashFlow

) {
}
