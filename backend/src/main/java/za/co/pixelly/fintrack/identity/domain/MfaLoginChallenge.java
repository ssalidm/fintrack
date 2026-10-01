package za.co.pixelly.fintrack.identity.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
    name = "mfa_login_challenges",
    schema = "identity"
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MfaLoginChallenge {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(
        name = "token_hash",
        nullable = false,
        length = 64
    )
    private String tokenHash;

    @Column(name = "user_agent", length = 512)
    private String userAgent;

    @Column(name = "attempt_count", nullable = false)
    private short attemptCount;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "consumed_at")
    private Instant consumedAt;

    @Column(name = "invalidated_at")
    private Instant invalidatedAt;

    public static MfaLoginChallenge issue(
        UUID userId,
        String tokenHash,
        String userAgent,
        Instant now,
        Instant expiresAt
    ) {
        MfaLoginChallenge challenge =
            new MfaLoginChallenge();

        challenge.userId = userId;
        challenge.tokenHash = tokenHash;
        challenge.userAgent =
            truncate(userAgent, 512);
        challenge.attemptCount = 0;
        challenge.createdAt = now;
        challenge.expiresAt = expiresAt;

        return challenge;
    }

    public boolean isUsable(
        Instant now,
        int maxAttempts
    ) {
        return consumedAt == null
            && invalidatedAt == null
            && expiresAt.isAfter(now)
            && attemptCount < maxAttempts;
    }

    public void recordFailedAttempt(
        Instant now,
        int maxAttempts
    ) {
        if (consumedAt != null || invalidatedAt != null) {
            return;
        }

        attemptCount++;

        if (attemptCount >= maxAttempts) {
            invalidatedAt = now;
        }
    }

    public void consume(Instant now) {
        if (consumedAt != null || invalidatedAt != null) {
            throw new IllegalStateException(
                "MFA challenge is no longer active"
            );
        }

        consumedAt = now;
    }

    public void invalidate(Instant now) {
        if (consumedAt == null && invalidatedAt == null) {
            invalidatedAt = now;
        }
    }

    private static String truncate(
        String value,
        int maxLength
    ) {
        if (value == null) {
            return null;
        }

        return value.length() <= maxLength
            ? value
            : value.substring(0, maxLength);
    }
}
