package za.co.pixelly.fintrack.support.security;

import org.jspecify.annotations.NonNull;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import za.co.pixelly.fintrack.config.support.SupportProperties;

import java.util.HashMap;
import java.util.Map;

@Component
public class TurnstileVerifier {

    private final RestClient restClient;
    private final SupportProperties properties;


    public TurnstileVerifier(
        @Qualifier("turnstileRestClient")
        RestClient restClient,
        SupportProperties properties
    ) {
        this.restClient = restClient;
        this.properties = properties;
    }


    public void verify(
        String token,
        String clientIp
    ) {
        Map<String, String> payload = getPayload(token, clientIp);

        TurnstileResponse response;

        try {
            response =
                restClient
                    .post()
                    .uri(
                        "/turnstile/v0/siteverify"
                    )
                    .body(payload)
                    .retrieve()
                    .body(
                        TurnstileResponse.class
                    );

        } catch (
            RestClientException exception
        ) {
            throw new SupportVerificationUnavailableException(
                exception
            );
        }

        if (
            response == null
                || !response.success()
        ) {
            throw new SupportVerificationException();
        }

        validateHostname(
            response.hostname()
        );

        validateAction(
            response.action()
        );
    }

    private Map<String, String> getPayload(
        String token,
        String clientIp
    ) {
        String secretKey =
            properties.turnstile().secretKey();

        if (
            secretKey == null || secretKey.isBlank()
        ) {
            /*
             * Fail closed.
             *
             * A configuration mistake must never
             * silently disable bot protection.
             */
            throw new SupportVerificationUnavailableException(
                new IllegalStateException(
                    "Turnstile secret key is not configured"
                )
            );
        }

        Map<String, String> payload =
            new HashMap<>();

        payload.put("secret", secretKey);
        payload.put("response", token);

        if (
            clientIp != null && !clientIp.isBlank()
        ) {
            payload.put("remoteip", clientIp);
        }
        return payload;
    }


    private void validateHostname(
        String actualHostname
    ) {
        String expectedHostname =
            properties.turnstile().expectedHostname();

        if (expectedHostname == null || expectedHostname.isBlank()) {
            return;
        }

        if (!expectedHostname.equalsIgnoreCase(actualHostname)) {
            throw new SupportVerificationException();
        }
    }


    private void validateAction(
        String actualAction
    ) {
        String expectedAction =
            properties.turnstile().expectedAction();

        if (expectedAction == null || expectedAction.isBlank()) {
            return;
        }

        if (!expectedAction.equals(actualAction)) {
            throw new SupportVerificationException();
        }
    }


    private record TurnstileResponse(
        boolean success,
        String hostname,
        String action
    ) {
    }
}
