package za.co.pixelly.fintrack.reporting.persistence;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record AccountBalanceRow(
    UUID accountId,
    String accountName,
    String accountType,
    String currencyCode,
    BigDecimal openingBalance,
    BigDecimal transactionTotal,
    BigDecimal currentBalance,
    long postedTransactionCount,
    boolean includeInNetWorth,
    String status,
    Instant createdAt,
    Instant updatedAt
) {
}
