package za.co.pixelly.fintrack.finance.budget.api;

import jakarta.validation.constraints.NotNull;

public record ArchiveBudgetRequest(

    @NotNull
    Long version

) {
}
