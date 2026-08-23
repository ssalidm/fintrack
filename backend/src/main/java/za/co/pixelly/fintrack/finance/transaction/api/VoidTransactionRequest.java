package za.co.pixelly.fintrack.finance.transaction.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record VoidTransactionRequest(

    @NotNull
    Long version,

    @NotBlank
    @Size(max = 255)
    String reason

) {
}
