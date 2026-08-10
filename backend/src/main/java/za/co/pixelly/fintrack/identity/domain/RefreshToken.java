package za.co.pixelly.fintrack.identity.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "refresh_tokens", schema = "identity")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "session_id", nullable = false)
    private UUID sessionId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "token_hash", nullable = false, length = 64)
    private String tokenHash;

    @Column(name = "issued_at", nullable = false)
    private Instant issuedAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "consumed_at")
    private Instant consumedAt;

    @Column(name = "revoked_at")
    private Instant revokedAt;

    @Column(name = "revocation_reason", length = 255)
    private String revocationReason;

    @Column(name = "replaced_by_token_id")
    private UUID replacedByTokenId;

    public static RefreshToken issue(
        UUID sessionId,
        UUID userId,
        String tokenHash,
        Instant issuedAt,
        Instant expiresAt
    ) {
        RefreshToken token = new RefreshToken();

        token.sessionId = sessionId;
        token.userId = userId;
        token.tokenHash = tokenHash;
        token.issuedAt = issuedAt;
        token.expiresAt = expiresAt;

        return token;
    }

    public boolean isUsable(Instant now) {
        return consumedAt == null
            && revokedAt == null
            && expiresAt.isAfter(now);
    }

    public void rotateTo(
        Instant now,
        UUID replacementTokenId
    ) {
        consumedAt = now;
        replacedByTokenId = replacementTokenId;
    }
}
