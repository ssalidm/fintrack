package za.co.pixelly.fintrack.identity.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import za.co.pixelly.fintrack.common.validation.constraints.StrongPassword;

public record RegisterRequest(

    @NotBlank(message = "Email is required")
    @Size(max = 320)
    @Pattern(
        regexp = "^[a-zA-Z0-9_!#$%&'*+/=?`{|}~^.-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
        message = "Invalid email format"
    )
    String email,

    @NotBlank(message = "Password is required")
    @StrongPassword
    String password,

    @NotBlank(message = "First name is required")
    @Pattern(regexp = "^[\\p{L}\\s\\-]+$", message = "First name contains invalid characters")
    @Size(max = 100)
    String firstName,

    @NotBlank(message = "Last name is required")
    @Pattern(regexp = "^[\\p{L}\\s\\-]+$", message = "Last name contains invalid characters")
    @Size(max = 100)
    String lastName
) {
}
