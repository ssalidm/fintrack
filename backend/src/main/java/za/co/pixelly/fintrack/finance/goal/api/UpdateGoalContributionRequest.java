package za.co.pixelly.fintrack.finance.goal.api;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UpdateGoalContributionRequest(

    @NotNull
    Long version,

    @DecimalMin("0.0001")
    @Digits(integer = 15, fraction = 4)
    BigDecimal amount,

    LocalDate contributionDate,

    @Size(max = 500)
    String note

) {

    @AssertTrue(message = "At least one contribution field must be provided")
    public boolean isUpdateProvided() {
        return amount != null
            || contributionDate != null
            || note != null;
    }
}
