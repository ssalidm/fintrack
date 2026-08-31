package za.co.pixelly.fintrack.reporting.api;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record MonthlyCategorySpendingResponse(

    String currencyCode,
    LocalDate monthStart,
    UUID categoryId,
    String categoryName,
    BigDecimal spentAmount,
    long transactionCount

) {
}
