package za.co.pixelly.fintrack.identity.api;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record EmailChangeRequestDto(

    @NotBlank
    @Email
    @Size(max = 320)
    String newEmail,

    @NotBlank
    @Size(max = 128)
    String currentPassword,

    @Size(max = 64)
    String mfaCode

) {
}
