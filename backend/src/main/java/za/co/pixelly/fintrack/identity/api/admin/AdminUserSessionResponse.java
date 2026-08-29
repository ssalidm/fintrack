package za.co.pixelly.fintrack.identity.api.admin;

import za.co.pixelly.fintrack.identity.domain.AuthSession;

import java.time.Instant;
import java.util.UUID;

public record AdminUserSessionResponse(
    UUID id,
    Instant createdAt,
    Instant lastSeenAt,
    Instant expiresAt,
    boolean active,
    Instant revokedAt,
    String revocationReason,
    String userAgent,
    long version
) {

    public static AdminUserSessionResponse from(
        AuthSession session,
        Instant now
    ) {
        return new AdminUserSessionResponse(
            session.getId(),
            session.getCreatedAt(),
            session.getLastSeenAt(),
            session.getExpiresAt(),
            session.isActive(now),
            session.getRevokedAt(),
            session.getRevocationReason(),
            session.getUserAgent(),
            session.getVersion()
        );
    }
}
