package za.co.pixelly.fintrack.identity.domain;

import jakarta.persistence.*;
import lombok.Getter;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "users", schema = "identity")
@Getter
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 320)
    private String email;

    /*
     * External-identity-only accounts do not have
     * a local password until the user explicitly
     * creates one.
     */
    @Column(name = "password_hash", length = 255)
    private String passwordHash;

    @Column(
        name = "first_name",
        nullable = false,
        length = 100
    )
    private String firstName;

    @Column(
        name = "last_name",
        nullable = false,
        length = 100
    )
    private String lastName;

    @Column(
        name = "preferred_name",
        length = 100
    )
    private String preferredName;

    @Column(
        name = "time_zone",
        nullable = false,
        length = 64
    )
    private String timeZone;

    @Enumerated(EnumType.STRING)
    @Column(
        nullable = false,
        length = 32
    )
    private UserStatus status;

    @Column(name = "email_verified_at")
    private Instant emailVerifiedAt;

    @Column(
        name = "failed_login_attempts",
        nullable = false
    )
    private int failedLoginAttempts;

    @Column(name = "locked_until")
    private Instant lockedUntil;

    @Column(name = "last_login_at")
    private Instant lastLoginAt;

    @Column(name = "password_changed_at")
    private Instant passwordChangedAt;

    @Column(
        name = "created_at",
        nullable = false
    )
    private Instant createdAt;

    @Column(
        name = "updated_at",
        nullable = false
    )
    private Instant updatedAt;

    @Version
    @Column(nullable = false)
    private long version;


    protected User() {
    }


    private User(
        String email,
        String passwordHash,
        String firstName,
        String lastName,
        UserStatus status,
        Instant emailVerifiedAt,
        Instant now
    ) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.firstName = firstName;
        this.lastName = lastName;
        this.timeZone = "UTC";
        this.status = status;
        this.emailVerifiedAt = emailVerifiedAt;
        this.failedLoginAttempts = 0;
        this.createdAt = now;
        this.updatedAt = now;
    }


    public static User registerVerified(
        String email,
        String passwordHash,
        String firstName,
        String lastName,
        String preferredName,
        Instant now
    ) {
        User user = new User();

        user.email = email;
        user.passwordHash = passwordHash;
        user.firstName = firstName.trim();
        user.lastName = lastName.trim();

        user.preferredName =
            preferredName == null
                || preferredName.isBlank()
                ? null
                : preferredName.trim();

        user.timeZone = "UTC";
        user.status = UserStatus.ACTIVE;
        user.emailVerifiedAt = now;
        user.failedLoginAttempts = 0;
        user.createdAt = now;
        user.updatedAt = now;

        return user;
    }


    public static User register(
        String email,
        String passwordHash,
        String firstName,
        String lastName
    ) {
        Instant now = Instant.now();

        return new User(
            email,
            passwordHash,
            firstName,
            lastName,
            UserStatus.PENDING_VERIFICATION,
            null,
            now
        );
    }


    public static User registerExternal(
        String email,
        String firstName,
        String lastName,
        boolean emailVerified,
        Instant now
    ) {
        return new User(
            email,
            null,
            firstName,
            lastName,
            emailVerified
                ? UserStatus.ACTIVE
                : UserStatus.PENDING_VERIFICATION,
            emailVerified
                ? now
                : null,
            now
        );
    }


    public boolean hasPassword() {
        return passwordHash != null
            && !passwordHash.isBlank();
    }


    public boolean isActive() {
        return status == UserStatus.ACTIVE;
    }


    public boolean canAuthenticate(
        Instant now
    ) {
        return isActive()
            && !isTemporarilyLocked(
            now
        );
    }


    public boolean isPendingVerification() {
        return status == UserStatus.PENDING_VERIFICATION;
    }


    public void verifyEmail(
        Instant now
    ) {
        if (
            status != UserStatus.PENDING_VERIFICATION
        ) {
            throw new IllegalStateException(
                "User is not awaiting email verification"
            );
        }

        status = UserStatus.ACTIVE;
        emailVerifiedAt = now;
        updatedAt = now;
    }


    public void recordSuccessfulLogin(
        Instant now
    ) {
        failedLoginAttempts = 0;
        lockedUntil = null;
        lastLoginAt = now;
        updatedAt = now;
    }


    public boolean isPasswordResetEligible() {
        return status != UserStatus.DEACTIVATED;
    }


    public void resetPassword(
        String newPasswordHash,
        Instant now
    ) {
        passwordHash = newPasswordHash;
        passwordChangedAt = now;
        failedLoginAttempts = 0;
        lockedUntil = null;
        updatedAt = now;
    }


    public boolean isTemporarilyLocked(
        Instant now
    ) {
        return lockedUntil != null
            && lockedUntil.isAfter(
            now
        );
    }


    public void recordFailedLogin(
        Instant now,
        int maxFailedAttempts,
        Duration lockDuration
    ) {
        if (
            lockedUntil != null
                && !lockedUntil.isAfter(
                now
            )
        ) {
            failedLoginAttempts = 0;
            lockedUntil = null;
        }

        failedLoginAttempts++;

        if (
            failedLoginAttempts >= maxFailedAttempts
        ) {
            lockedUntil = now.plus(lockDuration);
        }

        updatedAt = now;
    }


    public void updateProfile(
        String firstName,
        String lastName,
        String preferredName,
        String timeZone
    ) {
        if (firstName != null) {
            this.firstName = firstName.trim();
        }

        if (lastName != null) {
            this.lastName = lastName.trim();
        }

        if (preferredName != null) {
            this.preferredName =
                preferredName.isBlank()
                    ? null
                    : preferredName.trim();
        }

        if (timeZone != null) {
            this.timeZone = timeZone.trim();
        }
    }


    public void changeEmail(
        String newEmail,
        Instant now
    ) {
        email = newEmail;
        emailVerifiedAt = now;
        updatedAt = now;
    }


    public void updateTimeZone(
        String timeZone,
        Instant now
    ) {
        this.timeZone = timeZone;
        updatedAt = now;
    }


    public void deactivate(
        Instant now
    ) {
        if (
            status == UserStatus.DEACTIVATED
        ) {
            throw new IllegalStateException(
                "User is already deactivated"
            );
        }

        status = UserStatus.DEACTIVATED;
        updatedAt = now;
    }


    public void activate(
        Instant now
    ) {
        if (
            status != UserStatus.DEACTIVATED
        ) {
            throw new IllegalStateException(
                "Only deactivated users can be activated"
            );
        }

        status = UserStatus.ACTIVE;
        updatedAt = now;
    }


    @PreUpdate
    void updateTimeStamp() {
        updatedAt =
            Instant.now();
    }
}
