package za.co.pixelly.fintrack.finance.goal.api;

import jakarta.validation.constraints.NotNull;

public record CompleteSavingsGoalRequest(

    @NotNull
    Long version

) {
}
