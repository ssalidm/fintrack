package za.co.pixelly.fintrack.identity.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
    name = "email_change_requests",
    schema = "identity"
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class EmailChangeRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(
        name = "current_email",
        nullable = false,
        length = 320
    )
    private String currentEmail;

    @Column(
        name = "new_email",
        nullable = false,
        length = 320
    )
    private String newEmail;

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

    @Column(name = "confirmed_at")
    private Instant confirmedAt;

    @Column(name = "invalidated_at")
    private Instant invalidatedAt;

    public static EmailChangeRequest issue(
        UUID userId,
        String currentEmail,
        String newEmail,
        String tokenHash,
        Instant now,
        Instant expiresAt
    ) {
        EmailChangeRequest request =
            new EmailChangeRequest();

        request.userId = userId;
        request.currentEmail = currentEmail;
        request.newEmail = newEmail;
        request.tokenHash = tokenHash;
        request.createdAt = now;
        request.expiresAt = expiresAt;

        return request;
    }

    public boolean isUsable(
        Instant now
    ) {
        return confirmedAt == null
            && invalidatedAt == null
            && expiresAt.isAfter(now);
    }

    public void confirm(
        Instant now
    ) {
        if (!isUsable(now)) {
            throw new IllegalStateException(
                "Email change request is no longer active"
            );
        }

        confirmedAt = now;
    }

    public void invalidate(
        Instant now
    ) {
        if (
            confirmedAt == null
                && invalidatedAt == null
        ) {
            invalidatedAt = now;
        }
    }
}
