package za.co.pixelly.fintrack.reporting.api;

import java.math.BigDecimal;

public record NetWorthReportResponse(

    String currencyCode,
    BigDecimal netWorth,
    long includeAccountCount,
    long activeAccountCount,
    long archiveAccountCount

) {
}
