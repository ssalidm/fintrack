package za.co.pixelly.fintrack.identity.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record StartRegistrationRequest(

    @NotBlank(message = "Email is required")
    @Size(max = 320)
    @Pattern(
        regexp = "^[a-zA-Z0-9_!#$%&'*+/=?`{|}~^.-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
        message = "Invalid email format"
    )
    String email

) {
}
