package za.co.pixelly.fintrack.finance.transfer.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record VoidTransferRequest(
    @NotBlank(message = "Void reason is required")
    @Size(max = 255)
    String reason
) {
}
