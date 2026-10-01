package za.co.pixelly.fintrack.identity.application.mfa;

import java.time.Instant;

public record IssuedMfaChallenge(
    String rawToken,
    Instant expiresAt
) {
}
