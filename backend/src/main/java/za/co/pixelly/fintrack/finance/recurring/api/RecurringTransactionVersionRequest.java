package za.co.pixelly.fintrack.finance.recurring.api;

import jakarta.validation.constraints.NotNull;

public record RecurringTransactionVersionRequest(

    @NotNull
    Long version

) {
}
