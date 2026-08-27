package za.co.pixelly.fintrack.finance.goal.api;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateGoalContributionRequest(

    @NotNull
    @DecimalMin("0.0001")
    @Digits(integer = 15, fraction = 4)
    BigDecimal amount,

    @NotNull
    LocalDate contributionDate,

    @Size(max = 500)
    String note

) {
}
