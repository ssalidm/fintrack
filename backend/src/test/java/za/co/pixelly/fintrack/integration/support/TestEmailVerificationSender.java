package za.co.pixelly.fintrack.integration.support;

import za.co.pixelly.fintrack.identity.application.EmailVerificationSender;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class TestEmailVerificationSender
    implements EmailVerificationSender {

    private final Map<String, SentVerification> messages =
        new ConcurrentHashMap<>();

    @Override
    public void sendVerificationEmail(
        String email,
        String rawToken,
        Instant expiresAt
    ) {
        messages.put(
            email,
            new SentVerification(
                rawToken,
                expiresAt
            )
        );
    }

    public String tokenFor(String email) {
        SentVerification message =
            messages.get(email);

        return message == null
            ? null
            : message.rawToken();
    }

    public record SentVerification(
        String rawToken,
        Instant expiresAt
    ) {
    }
}
