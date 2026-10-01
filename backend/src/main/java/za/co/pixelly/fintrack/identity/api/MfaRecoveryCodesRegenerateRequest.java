package za.co.pixelly.fintrack.identity.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record MfaRecoveryCodesRegenerateRequest(

    @NotBlank
    @Size(max = 128)
    String currentPassword,

    @NotBlank
    @Pattern(
        regexp = "\\d{6}",
        message = "Authenticator code must contain exactly 6 digits"
    )
    String code

) {
}
