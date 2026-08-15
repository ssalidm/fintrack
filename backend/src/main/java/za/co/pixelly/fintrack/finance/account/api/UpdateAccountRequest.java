package za.co.pixelly.fintrack.finance.account.api;

import jakarta.validation.constraints.*;
import za.co.pixelly.fintrack.finance.account.domain.AccountType;

import java.math.BigDecimal;

public record UpdateAccountRequest(

    @NotNull
    Long version,

    @Size(max = 100)
    @Pattern(
        regexp = ".*\\S.*",
        message = "name must not be blank"
    )
    String name,

    AccountType accountType,

    @Digits(
        integer = 15,
        fraction = 4
    )
    BigDecimal openingBalance,

    Boolean includeInNetWorth
) {

    @AssertTrue(
        message = "At least one account field must be provided"
    )
    public boolean isUpdateProvided() {
        return name != null
            || accountType != null
            || openingBalance != null
            || includeInNetWorth != null;
    }
}
