package za.co.pixelly.fintrack.finance.budget.api;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record CreateBudgetLimitRequest(

    @NotNull
    UUID categoryId,

    @NotNull
    @DecimalMin("0.0001")
    @Digits(
        integer = 15,
        fraction = 4
    )
    BigDecimal limitAmount

) {
}
