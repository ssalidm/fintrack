package za.co.pixelly.fintrack.identity.api;

import za.co.pixelly.fintrack.identity.domain.AuthSession;

import java.time.Instant;
import java.util.UUID;

public record UserSessionResponse(
    UUID id,
    Instant createdAt,
    Instant lastSeenAt,
    Instant expiresAt,
    String userAgent,
    boolean current
) {

    public static UserSessionResponse from(
        AuthSession session,
        UUID currentSessionId
    ) {
        return new UserSessionResponse(
            session.getId(),
            session.getCreatedAt(),
            session.getLastSeenAt(),
            session.getExpiresAt(),
            session.getUserAgent(),
            session.getId().equals(currentSessionId)
        );
    }
}
