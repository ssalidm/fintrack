package za.co.pixelly.fintrack.identity.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
    name = "email_verification_tokens",
    schema = "identity"
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class EmailVerificationToken {

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

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "consumed_at")
    private Instant consumedAt;

    @Column(name = "invalidated_at")
    private Instant invalidatedAt;

    public static EmailVerificationToken issue(
        UUID userId,
        String tokenHash,
        Instant createdAt,
        Instant expiresAt
    ) {
        EmailVerificationToken token =
            new EmailVerificationToken();

        token.userId = userId;
        token.tokenHash = tokenHash;
        token.createdAt = createdAt;
        token.expiresAt = expiresAt;

        return token;
    }

    public boolean isUsable(Instant now) {
        return consumedAt == null
            && invalidatedAt == null
            && expiresAt.isAfter(now);
    }

    public void consume(Instant now) {
        if (!isUsable(now)) {
            throw new IllegalStateException(
                "Verification token is not usable"
            );
        }

        consumedAt = now;
    }

    public void invalidate(Instant now) {
        if (consumedAt == null && invalidatedAt == null) {
            invalidatedAt = now;
        }
    }
}
