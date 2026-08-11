package za.co.pixelly.fintrack.identity.api;

import jakarta.validation.constraints.NotBlank;

public record VerifyEmailRequest(

    @NotBlank
    String token

) {
}
