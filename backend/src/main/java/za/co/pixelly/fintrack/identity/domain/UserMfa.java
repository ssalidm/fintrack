package za.co.pixelly.fintrack.identity.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "user_mfa", schema = "identity")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserMfa {

    @Id
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private MfaStatus status;

    @Column(
        name = "totp_secret_ciphertext",
        nullable = false
    )
    private byte[] totpSecretCiphertext;

    @Column(
        name = "totp_secret_iv",
        nullable = false
    )
    private byte[] totpSecretIv;

    @Column(name = "last_used_time_step")
    private Long lastUsedTimeStep;

    @Column(name = "enabled_at")
    private Instant enabledAt;

    @Column(
        name = "failed_attempt_count",
        nullable = false
    )
    private short failedAttemptCount;

    @Column(name = "locked_until")
    private Instant lockedUntil;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Version
    @Column(nullable = false)
    private long version;

    public static UserMfa startSetup(
        UUID userId,
        byte[] ciphertext,
        byte[] iv,
        Instant now
    ) {
        UserMfa mfa = new UserMfa();

        mfa.userId = userId;
        mfa.status = MfaStatus.PENDING;
        mfa.totpSecretCiphertext = ciphertext.clone();
        mfa.totpSecretIv = iv.clone();
        mfa.createdAt = now;
        mfa.updatedAt = now;

        return mfa;
    }

    public boolean isEnabled() {
        return status == MfaStatus.ENABLED;
    }

    public boolean isPending() {
        return status == MfaStatus.PENDING;
    }

    public void replacePendingSecret(
        byte[] ciphertext,
        byte[] iv,
        Instant now
    ) {
        if (!isPending()) {
            throw new IllegalStateException(
                "MFA setup is not pending"
            );
        }

        this.totpSecretCiphertext = ciphertext.clone();
        this.totpSecretIv = iv.clone();
        this.lastUsedTimeStep = null;
        this.updatedAt = now;
    }

    public void enable(Instant now) {
        if (!isPending()) {
            throw new IllegalStateException(
                "MFA setup is not pending"
            );
        }

        this.status = MfaStatus.ENABLED;
        this.enabledAt = now;
        this.updatedAt = now;
    }

    public boolean canUseTimeStep(long timeStep) {
        return lastUsedTimeStep == null
            || timeStep > lastUsedTimeStep;
    }

    public void recordUsedTimeStep(
        long timeStep,
        Instant now
    ) {
        if (!isEnabled()) {
            throw new IllegalStateException(
                "MFA is not enabled"
            );
        }

        if (!canUseTimeStep(timeStep)) {
            throw new IllegalStateException(
                "TOTP time step has already been used"
            );
        }

        this.lastUsedTimeStep = timeStep;
        this.updatedAt = now;
    }

    public byte[] getTotpSecretCiphertext() {
        return totpSecretCiphertext.clone();
    }

    public byte[] getTotpSecretIv() {
        return totpSecretIv.clone();
    }

    public boolean isTemporarilyLocked(
        Instant now
    ) {
        return lockedUntil != null
            && lockedUntil.isAfter(now);
    }

    public void recordFailedAuthentication(
        Instant now,
        int maxAttempts,
        Duration lockoutDuration
    ) {
        if (!isEnabled()) {
            throw new IllegalStateException(
                "MFA is not enabled"
            );
        }

        /*
         * A previous lock has expired, so begin a fresh
         * failure window.
         */
        if (
            lockedUntil != null
                && !lockedUntil.isAfter(now)
        ) {
            lockedUntil = null;
            failedAttemptCount = 0;
        }

        failedAttemptCount++;
        updatedAt = now;

        if (failedAttemptCount >= maxAttempts) {
            /*
             * Start a fresh allowance after the cooldown
             * instead of instantly locking again.
             */
            failedAttemptCount = 0;

            lockedUntil =
                now.plus(lockoutDuration);
        }
    }

    public void clearAuthenticationFailures(
        Instant now
    ) {
        failedAttemptCount = 0;
        lockedUntil = null;
        updatedAt = now;
    }
}
