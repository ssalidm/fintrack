package za.co.pixelly.fintrack.reporting.persistence;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MonthlyCashFlowRow(
    String currencyCode,
    LocalDate monthStart,
    BigDecimal totalIncome,
    BigDecimal totalExpenses,
    BigDecimal netCashFlow
) {
}
