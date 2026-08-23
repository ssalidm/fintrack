package za.co.pixelly.fintrack.finance.transfer.api;


import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CreateTransferRequest(
    @NotNull(message = "Source account id is required")
    UUID sourceAccountId,

    @NotNull(message = "Destination account id is required")
    UUID destinationAccountId,

    @NotNull(message = "Amount is required")
    @DecimalMin("0.0001")
    @Digits(integer = 15, fraction = 4)
    BigDecimal amount,

    @NotNull(message = "Transaction date is required")
    LocalDate transactionDate,

    @Size(max = 500)
    String description

) {

    @AssertTrue(message = "Source and destination accounts must be different")
    public boolean isDifferentAccount() {
        if (sourceAccountId == null || destinationAccountId == null) {
            return true;
        }

        return !sourceAccountId.equals(destinationAccountId);
    }
}
