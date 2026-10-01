package za.co.pixelly.fintrack.identity.api;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import za.co.pixelly.fintrack.common.validation.constraints.StrongPassword;

public record CompleteRegistrationRequest(

    @NotBlank(message = "Registration token is required")
    String token,

    @NotBlank(message = "First name is required")
    @Pattern(
        regexp = "^[\\p{L}\\s\\-]+$",
        message = "First name contains invalid characters"
    )
    @Size(max = 100)
    String firstName,

    @NotBlank(message = "Last name is required")
    @Pattern(
        regexp = "^[\\p{L}\\s\\-]+$",
        message = "Last name contains invalid characters"
    )
    @Size(max = 100)
    String lastName,

    @Size(max = 100)
    String preferredName,

    @NotBlank(message = "Password is required")
    @StrongPassword
    String password,

    @AssertTrue(
        message = "You must accept the terms and privacy policy"
    )
    boolean acceptTerms

) {
}
