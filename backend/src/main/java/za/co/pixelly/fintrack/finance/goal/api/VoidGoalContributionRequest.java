package za.co.pixelly.fintrack.finance.goal.api;

import jakarta.validation.constraints.*;

public record VoidGoalContributionRequest(

    @NotNull
    Long version,

    @NotBlank
    @Size(max = 255)
    String reason

) {
}
