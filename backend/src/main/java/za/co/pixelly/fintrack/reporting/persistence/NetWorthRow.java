package za.co.pixelly.fintrack.reporting.persistence;

import java.math.BigDecimal;

public record NetWorthRow(
    String currencyCode,
    BigDecimal netWorth,
    long includedAccountCount,
    long activeAccountCount,
    long archivedAccountCount
) {
}
