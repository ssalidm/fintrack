package za.co.pixelly.fintrack.identity.application;

import java.time.Instant;

public record EmailVerificationRequested(
    String email,
    String rawToken,
    Instant expiresAt
) {
}
