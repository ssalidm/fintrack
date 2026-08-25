package za.co.pixelly.fintrack.finance.budget.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CreateBudgetRequest(

    @NotBlank
    @Size(max = 100)
    String name,

    @NotNull
    LocalDate budgetMonth,

    @NotBlank
    @Pattern(
        regexp = "(?i)^[A-Z]{3}$",
        message = "currencyCode must be a three-letter ISO currency code"
    )
    String currencyCode

) {
}
