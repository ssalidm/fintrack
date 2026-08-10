package za.co.pixelly.fintrack.integration.support;

import za.co.pixelly.fintrack.identity.application.PasswordResetSender;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class TestPasswordResetSender
    implements PasswordResetSender {

    private final Map<String, SentReset> messages =
        new ConcurrentHashMap<>();

    @Override
    public void sendPasswordReset(
        String email,
        String rawToken,
        Instant expiresAt
    ) {
        messages.put(
            email,
            new SentReset(
                rawToken,
                expiresAt
            )
        );
    }

    public String tokenFor(String email) {

        SentReset reset =
            messages.get(email);

        return reset == null
            ? null
            : reset.rawToken();
    }

    public record SentReset(
        String rawToken,
        Instant expiresAt
    ) {
    }
}
