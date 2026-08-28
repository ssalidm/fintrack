package za.co.pixelly.fintrack.identity.api;

import jakarta.validation.constraints.NotBlank;
import za.co.pixelly.fintrack.common.validation.constraints.StrongPassword;

public record ChangePasswordRequest(

    @NotBlank(message = "Current password is required")
    String currentPassword,

    @NotBlank(message = "New password is required")
    @StrongPassword
    String newPassword

) {
}
