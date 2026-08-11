package za.co.pixelly.fintrack.identity.application;

import java.time.Instant;

public interface PasswordResetSender {

    void sendPasswordReset(
        String email,
        String rawToken,
        Instant expiresAt
    );
}
