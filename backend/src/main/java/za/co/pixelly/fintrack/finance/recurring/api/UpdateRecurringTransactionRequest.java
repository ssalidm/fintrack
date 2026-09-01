package za.co.pixelly.fintrack.finance.recurring.api;

import jakarta.validation.constraints.*;
import za.co.pixelly.fintrack.finance.recurring.domain.RecurringFrequency;
import za.co.pixelly.fintrack.finance.recurring.domain.RecurringTransactionType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record UpdateRecurringTransactionRequest(

    @NotNull
    Long version,

    UUID accountId,

    UUID categoryId,

    @Size(max = 100)
    String name,

    RecurringTransactionType transactionType,

    @DecimalMin("0.0001")
    @Digits(integer = 15, fraction = 4)
    BigDecimal amount,

    @Size(max = 500)
    String description,

    @Size(max = 200)
    String merchantName,

    RecurringFrequency frequency,

    @Min(1)
    @Max(365)
    Short intervalCount,

    LocalDate endDate,

    Boolean clearEndDate,

    Boolean autoPost

) {

    @AssertTrue(message = "name must not be blank when provided")
    public boolean isNameValid() {
        return name == null || !name.isBlank();
    }


    @AssertTrue(
        message =
            "endDate and clearEndDate=true cannot be supplied together"
    )
    public boolean isEndDateUpdateValid() {
        return endDate == null
            || !Boolean.TRUE.equals(
            clearEndDate
        );
    }


    @AssertTrue(
        message =
            "At least one recurring-transaction field must be provided"
    )
    public boolean isUpdateProvided() {
        return accountId != null
            || categoryId != null
            || name != null
            || transactionType != null
            || amount != null
            || description != null
            || merchantName != null
            || frequency != null
            || intervalCount != null
            || endDate != null
            || Boolean.TRUE.equals(
            clearEndDate
        )
            || autoPost != null;
    }
}
