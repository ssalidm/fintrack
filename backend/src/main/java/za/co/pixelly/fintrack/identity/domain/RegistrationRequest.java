package za.co.pixelly.fintrack.identity.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
    name = "registration_requests",
    schema = "identity"
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RegistrationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(
        nullable = false,
        length = 320
    )
    private String email;

    @Column(
        name = "token_hash",
        nullable = false,
        length = 64
    )
    private String tokenHash;

    @Column(
        name = "created_at",
        nullable = false
    )
    private Instant createdAt;

    @Column(
        name = "expires_at",
        nullable = false
    )
    private Instant expiresAt;

    @Column(name = "consumed_at")
    private Instant consumedAt;

    @Column(name = "invalidated_at")
    private Instant invalidatedAt;


    public static RegistrationRequest issue(
        String email,
        String tokenHash,
        Instant now,
        Instant expiresAt
    ) {
        RegistrationRequest request =
            new RegistrationRequest();

        request.email = email;
        request.tokenHash = tokenHash;
        request.createdAt = now;
        request.expiresAt = expiresAt;

        return request;
    }


    public boolean isUsable(Instant now) {
        return consumedAt == null
            && invalidatedAt == null
            && expiresAt.isAfter(now);
    }


    public void consume(Instant now) {
        if (!isUsable(now)) {
            throw new IllegalStateException(
                "Registration request is no longer active"
            );
        }

        consumedAt = now;
    }


    public void invalidate(Instant now) {
        if (
            consumedAt == null
                && invalidatedAt == null
        ) {
            invalidatedAt = now;
        }
    }
}
