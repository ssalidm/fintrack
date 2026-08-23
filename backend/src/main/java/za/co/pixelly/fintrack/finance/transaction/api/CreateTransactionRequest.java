package za.co.pixelly.fintrack.finance.transaction.api;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CreateTransactionRequest(

    @NotNull(message = "Account id is required")
    UUID accountId,

    @NotNull(message = "Category id is required")
    UUID categoryId,

    @NotNull(message = "Transaction type is required")
    ManualTransactionType transactionType,

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.0001", inclusive = true)
    @Digits(integer = 15, fraction = 4)
    BigDecimal amount,

    @NotNull(message = "Transaction date is required")
    LocalDate transactionDate,

    @Size(max = 500)
    String description,

    @Size(max = 200)
    String merchantName
) {
}
