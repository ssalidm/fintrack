package za.co.pixelly.fintrack.integration.support;

import za.co.pixelly.fintrack.identity.application.RegistrationEmailSender;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class TestRegistrationEmailSender
    implements RegistrationEmailSender {

    private final Map<String, String> tokens =
        new ConcurrentHashMap<>();

    @Override
    public void sendRegistrationEmail(
        String email,
        String rawToken
    ) {
        tokens.put(
            email,
            rawToken
        );
    }

    public String tokenFor(String email) {
        return tokens.get(
            email
        );
    }

    public boolean hasEmailFor(String email) {
        return tokens.containsKey(
            email
        );
    }

    public void clear() {
        tokens.clear();
    }
}
