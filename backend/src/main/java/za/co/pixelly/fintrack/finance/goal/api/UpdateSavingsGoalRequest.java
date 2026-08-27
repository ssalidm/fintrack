package za.co.pixelly.fintrack.finance.goal.api;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UpdateSavingsGoalRequest(

    @NotNull
    Long version,

    @Size(max = 100)
    String name,

    @Size(max = 500)
    String description,

    @DecimalMin("0.0001")
    @Digits(integer = 15, fraction = 4)
    BigDecimal targetAmount,

    LocalDate targetDate,

    Boolean clearTargetDate

) {

    @AssertTrue(message = "name must not be blank when provided")
    public boolean isNameValid() {
        return name == null || !name.isBlank();
    }


    @AssertTrue(message = "targetDate and clearTargetDate=true cannot be supplied together")
    public boolean isTargetDateValid() {
        return targetDate == null || !Boolean.TRUE.equals(clearTargetDate);
    }


    @AssertTrue(
        message = "At least one goal field must be provided")
    public boolean isUpdateProvided() {
        return name != null
            || description != null
            || targetAmount != null
            || targetDate != null
            || Boolean.TRUE.equals(
            clearTargetDate
        );
    }
}
