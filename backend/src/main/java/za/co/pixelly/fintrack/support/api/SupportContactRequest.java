package za.co.pixelly.fintrack.support.api;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SupportContactRequest(

    @NotBlank
    @Size(min = 2, max = 100)
    String name,

    @NotBlank
    @Email
    @Size(max = 254)
    String email,

    @NotNull
    SupportTopic topic,

    @NotBlank
    @Size(min = 10, max = 4000)
    String message,

    @NotBlank
    @Size(max = 2048)
    String turnstileToken,

    /*
     * Honeypot.
     *
     * Real users never populate this field.
     */
    @Size(max = 200)
    String website
) {
}
