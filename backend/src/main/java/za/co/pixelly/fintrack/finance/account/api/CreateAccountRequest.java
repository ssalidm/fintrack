package za.co.pixelly.fintrack.finance.account.api;

import jakarta.validation.constraints.*;
import za.co.pixelly.fintrack.finance.account.domain.AccountType;

import java.math.BigDecimal;

public record CreateAccountRequest(

    @NotBlank
    @Size(max = 100)
    String name,

    @NotNull
    AccountType accountType,

    @NotBlank
    @Pattern(regexp = "^[A-Za-z]{3}$")
    String currencyCode,

    @Digits(integer = 15, fraction = 4)
    BigDecimal openingBalance,

    Boolean includeInNetWorth
) {
}
