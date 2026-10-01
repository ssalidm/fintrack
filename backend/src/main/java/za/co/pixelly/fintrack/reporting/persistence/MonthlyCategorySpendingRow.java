package za.co.pixelly.fintrack.reporting.persistence;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record MonthlyCategorySpendingRow(
    String currencyCode,
    LocalDate monthStart,
    UUID categoryId,
    String categoryName,
    BigDecimal spentAmount,
    long transactionCount
) {
}
