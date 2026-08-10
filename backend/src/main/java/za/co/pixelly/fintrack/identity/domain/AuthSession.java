package za.co.pixelly.fintrack.identity.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "auth_sessions", schema = "identity")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AuthSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "last_seen_at", nullable = false)
    private Instant lastSeenAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "revoked_at", length = 225)
    private Instant revokedAt;

    @Column(name = "revocation_reason", length = 225)
    private String revocationReason;

    @Column(name = "user_agent", length = 512)
    private String userAgent;

    @Version
    @Column(nullable = false)
    private long version;

    public static AuthSession open(
        UUID userId,
        Instant now,
        Instant expiresAt,
        String userAgent
    ) {
        AuthSession session = new AuthSession();

        session.userId = userId;
        session.createdAt = now;
        session.lastSeenAt = now;
        session.expiresAt = expiresAt;
        session.userAgent = truncate(userAgent, 512);

        return session;
    }

    public boolean isActive(Instant now) {
        return revokedAt == null || expiresAt.isAfter(now);
    }

    public void touch(Instant now) {
        this.lastSeenAt = now;
    }

    public void revoke(Instant now, String reason) {
        if (revokedAt == null) {
            revokedAt = now;
            revocationReason = truncate(reason, 255);
        }
    }

    private static String truncate(String value, int max) {
        if (value == null) {
            return null;
        }

        return value.length() <= max
            ? value
            : value.substring(0, max);
    }
}
