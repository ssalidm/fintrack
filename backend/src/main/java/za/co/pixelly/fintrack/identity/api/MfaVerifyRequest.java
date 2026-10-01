package za.co.pixelly.fintrack.identity.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record MfaVerifyRequest(

    @NotBlank
    @Size(max = 512)
    String challengeToken,

    @NotBlank
    @Pattern(
        regexp = "\\d{6}",
        message = "Authenticator code must contain exactly 6 digits"
    )
    String code

) {
}
