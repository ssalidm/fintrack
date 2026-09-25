package za.co.pixelly.fintrack.identity.application;

public record RegistrationEmailRequested(
    String email,
    String rawToken
) {
}
