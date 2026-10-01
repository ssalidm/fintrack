package za.co.pixelly.fintrack.identity.application.emailchange;

import java.time.Instant;

public record EmailChangeInitiation(
    String currentEmail,
    String newEmail,
    String firstName,
    String rawToken,
    Instant expiresAt
) {
}
