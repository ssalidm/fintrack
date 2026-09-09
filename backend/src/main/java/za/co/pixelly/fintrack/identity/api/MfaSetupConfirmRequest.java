package za.co.pixelly.fintrack.identity.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record MfaSetupConfirmRequest(

    @NotBlank
    @Pattern(
        regexp = "\\d{6}",
        message = "Authenticator code must contain exactly 6 digits"
    )
    String code

) {
}
