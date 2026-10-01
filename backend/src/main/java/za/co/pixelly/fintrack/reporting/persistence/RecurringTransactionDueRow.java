package za.co.pixelly.fintrack.reporting.persistence;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record RecurringTransactionDueRow(
    UUID recurringTransactionId,
    String name,
    String transactionType,
    BigDecimal amount,
    String frequency,
    short intervalCount,
    LocalDate nextDueDate,
    int daysOverdue,
    boolean autoPost,
    UUID accountId,
    String accountName,
    String currencyCode,
    UUID categoryId,
    String categoryName
) {
}
