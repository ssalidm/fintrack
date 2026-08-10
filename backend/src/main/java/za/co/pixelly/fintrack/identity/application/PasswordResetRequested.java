package za.co.pixelly.fintrack.identity.application;

import java.time.Instant;

public record PasswordResetRequested(
    String email,
    String rawToken,
    Instant expiresAt
) {
}
