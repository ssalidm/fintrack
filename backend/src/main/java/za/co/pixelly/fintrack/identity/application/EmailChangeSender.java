package za.co.pixelly.fintrack.identity.application;

import java.time.Instant;

public interface EmailChangeSender {

    void sendVerificationEmail(
        String email,
        String firstName,
        String rawToken,
        Instant expiresAt
    );
}
