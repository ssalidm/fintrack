package za.co.pixelly.fintrack.identity.api;

import jakarta.validation.constraints.NotBlank;

public record ConfirmEmailChangeRequest(

    @NotBlank
    String token

) {
}
