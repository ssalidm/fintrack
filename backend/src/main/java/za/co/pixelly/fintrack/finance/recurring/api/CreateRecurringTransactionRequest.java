package za.co.pixelly.fintrack.finance.recurring.api;

import jakarta.validation.constraints.*;
import za.co.pixelly.fintrack.finance.recurring.domain.RecurringFrequency;
import za.co.pixelly.fintrack.finance.recurring.domain.RecurringTransactionType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CreateRecurringTransactionRequest(

    @NotNull
    UUID accountId,

    @NotNull
    UUID categoryId,

    @NotBlank
    @Size(max = 100)
    String name,

    @NotNull
    RecurringTransactionType transactionType,

    @NotNull
    @DecimalMin("0.0001")
    @Digits(integer = 15, fraction = 4)
    BigDecimal amount,

    @Size(max = 500)
    String description,

    @Size(max = 200)
    String merchantName,

    @NotNull
    RecurringFrequency frequency,

    @Min(1)
    @Max(365)
    short intervalCount,

    @NotNull
    LocalDate startDate,

    LocalDate endDate,

    boolean autoPost,

    @NotNull
    RecurringCatchUpMode catchUpMode

) {

    @AssertTrue(message = "endDate must be on or after startDate")
    public boolean isDateRangeValid() {

        if (startDate == null || endDate == null) {
            return true;
        }

        return !endDate.isBefore(startDate);
    }
}
