package za.co.pixelly.fintrack.identity.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MfaRecoverRequest(

    @NotBlank
    @Size(max = 512)
    String challengeToken,

    @NotBlank
    @Size(max = 64)
    String recoveryCode

) {
}
