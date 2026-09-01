package za.co.pixelly.fintrack.finance.transaction.api;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record UpdateTransactionRequest(

    @NotNull
    Long version,

    UUID accountId,

    UUID categoryId,

    ManualTransactionType transactionType,

    @DecimalMin(
        value = "0.0001",
        inclusive = true
    )
    @Digits(
        integer = 15,
        fraction = 4
    )
    BigDecimal amount,

    LocalDate transactionDate,

    @Size(max = 500)
    String description,

    @Size(max = 200)
    String merchantName

) {

    @AssertTrue(
        message = "At least one transaction field must be provided"
    )
    public boolean isUpdateProvided() {
        return accountId != null
            || categoryId != null
            || transactionType != null
            || amount != null
            || transactionDate != null
            || description != null
            || merchantName != null;
    }
}
