package za.co.pixelly.fintrack.identity.api;

import jakarta.validation.constraints.NotBlank;
import za.co.pixelly.fintrack.common.validation.constraints.StrongPassword;

public record ResetPasswordRequest(

    @NotBlank
    String token,

    @NotBlank(message = "Password is required")
    @StrongPassword
    String newPassword

) {
}
