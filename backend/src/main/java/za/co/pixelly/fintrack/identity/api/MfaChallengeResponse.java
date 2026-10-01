package za.co.pixelly.fintrack.identity.api;

import java.time.Instant;

public record MfaChallengeResponse(
    String challengeToken,
    Instant expiresAt
) {
}
