package za.co.pixelly.fintrack.identity.application;

import java.time.Instant;

public interface EmailVerificationSender {

    void sendVerificationEmail(
        String email,
        String rawToken,
        Instant expiresAt
    );
}
