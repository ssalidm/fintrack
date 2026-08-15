package za.co.pixelly.fintrack.finance.account.api;

import za.co.pixelly.fintrack.finance.account.domain.Account;
import za.co.pixelly.fintrack.finance.account.domain.AccountStatus;
import za.co.pixelly.fintrack.finance.account.domain.AccountType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record AccountResponse(
    UUID id,
    String name,
    AccountType accountType,
    String currencyCode,
    BigDecimal openingBalance,
    AccountStatus status,
    boolean includeInNetWorth,
    Instant archivedAt,
    Instant createdAt,
    Instant updatedAt,
    long version
) {

    public static AccountResponse from(Account account) {
        return new AccountResponse(
            account.getId(),
            account.getName(),
            account.getAccountType(),
            account.getCurrencyCode(),
            account.getOpeningBalance(),
            account.getStatus(),
            account.isIncludeInNetWorth(),
            account.getArchivedAt(),
            account.getCreatedAt(),
            account.getUpdatedAt(),
            account.getVersion()
        );
    }
}
