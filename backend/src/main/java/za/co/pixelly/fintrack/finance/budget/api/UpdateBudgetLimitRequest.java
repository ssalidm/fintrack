package za.co.pixelly.fintrack.finance.budget.api;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record UpdateBudgetLimitRequest(

    @NotNull
    Long version,

    UUID categoryId,

    @DecimalMin("0.0001")
    @Digits(
        integer = 15,
        fraction = 4
    )
    BigDecimal limitAmount

) {

    @AssertTrue(message = "At least one budget-limit field must be provided")
    public boolean isUpdateProvided() {
        return categoryId != null || limitAmount != null;
    }
}
