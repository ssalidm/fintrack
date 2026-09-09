package za.co.pixelly.fintrack.identity.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MfaDisableRequest(

    @NotBlank
    @Size(max = 128)
    String currentPassword,

    @NotBlank
    @Size(max = 64)
    String mfaCode

) {
}
