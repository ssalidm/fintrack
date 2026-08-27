package za.co.pixelly.fintrack.finance.goal.api;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateSavingsGoalRequest(

    @NotBlank
    @Size(max = 100)
    String name,

    @Size(max = 500)
    String description,

    @NotBlank
    @Pattern(
        regexp = "(?i)^[A-Z]{3}$",
        message = "currencyCode must be a three-letter ISO currency code")
    String currencyCode,

    @NotNull
    @DecimalMin("0.0001")
    @Digits(integer = 15, fraction = 4)
    BigDecimal targetAmount,

    LocalDate targetDate

) {
}
