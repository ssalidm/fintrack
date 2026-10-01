package za.co.pixelly.fintrack.integration.support;

import za.co.pixelly.fintrack.identity.application.EmailChangeSender;

import java.time.Instant;

public class TestEmailChangeSender
    implements EmailChangeSender {

    private String email;
    private String firstName;
    private String rawToken;
    private Instant expiresAt;

    @Override
    public void sendVerificationEmail(
        String email,
        String firstName,
        String rawToken,
        Instant expiresAt
    ) {
        this.email = email;
        this.firstName = firstName;
        this.rawToken = rawToken;
        this.expiresAt = expiresAt;
    }

    public String email() {
        return email;
    }

    public String firstName() {
        return firstName;
    }

    public String rawToken() {
        return rawToken;
    }

    public Instant expiresAt() {
        return expiresAt;
    }

    public void clear() {
        email = null;
        firstName = null;
        rawToken = null;
        expiresAt = null;
    }
}
