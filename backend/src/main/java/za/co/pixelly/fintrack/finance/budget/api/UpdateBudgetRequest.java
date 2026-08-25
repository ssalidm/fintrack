package za.co.pixelly.fintrack.finance.budget.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateBudgetRequest(

    @NotNull
    Long version,

    @NotBlank
    @Size(max = 100)
    String name

) {
}
