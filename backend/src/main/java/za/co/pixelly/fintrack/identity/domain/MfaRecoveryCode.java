package za.co.pixelly.fintrack.identity.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
    name = "mfa_recovery_codes",
    schema = "identity"
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MfaRecoveryCode {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(
        name = "code_hash",
        nullable = false,
        length = 64
    )
    private String codeHash;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "used_at")
    private Instant usedAt;

    public static MfaRecoveryCode issue(
        UUID userId,
        String codeHash,
        Instant now
    ) {
        MfaRecoveryCode recoveryCode =
            new MfaRecoveryCode();

        recoveryCode.userId = userId;
        recoveryCode.codeHash = codeHash;
        recoveryCode.createdAt = now;

        return recoveryCode;
    }

    public boolean isUsed() {
        return usedAt != null;
    }

    public void consume(Instant now) {
        if (isUsed()) {
            throw new IllegalStateException(
                "MFA recovery code has already been used"
            );
        }

        usedAt = now;
    }
}
