package za.co.pixelly.fintrack.support.application;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import za.co.pixelly.fintrack.common.email.EmailMessage;
import za.co.pixelly.fintrack.common.email.EmailSender;
import za.co.pixelly.fintrack.common.email.EmailTemplateRenderer;
import za.co.pixelly.fintrack.config.support.SupportProperties;
import za.co.pixelly.fintrack.support.api.SupportContactRequest;
import za.co.pixelly.fintrack.support.security.TurnstileVerifier;

import java.time.Clock;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SupportContactService {

    private static final String TEMPLATE = "email/support-contact";

    private final EmailSender emailSender;
    private final EmailTemplateRenderer emailTemplateRenderer;
    private final SupportProperties supportProperties;
    private final ContactAbuseGuard abuseGuard;
    private final TurnstileVerifier turnstileVerifier;
    private final Clock applicationClock;


    public void submit(
        SupportContactRequest request,
        String clientIp
    ) {
        /*
         * Honeypot.
         *
         * Deliberately pretend everything was successful
         * so simple bots cannot learn that they were
         * detected.
         */
        if (
            request.website() != null
                && !request.website().isBlank()
        ) {
            return;
        }

        abuseGuard.checkRateLimits(
            clientIp,
            request.email()
        );

        turnstileVerifier.verify(
            request.turnstileToken(),
            clientIp
        );

        Optional<String> reservation =
            abuseGuard.reserveSubmission(
                request
            );

        /*
         * Duplicate submissions receive the same
         * successful response but do not generate
         * another email.
         */
        if (reservation.isEmpty()) {
            return;
        }

        try {
            sendSupportEmail(
                request
            );
        } catch (
            RuntimeException exception
        ) {
            /*
             * Sending failed, so allow the visitor
             * to retry rather than treating the
             * failed attempt as a duplicate.
             */
            abuseGuard.releaseSubmission(
                reservation.get()
            );

            throw exception;
        }
    }


    private void sendSupportEmail(
        SupportContactRequest request
    ) {
        Instant submittedAt =
            applicationClock.instant();

        String body =
            emailTemplateRenderer.render(
                TEMPLATE,
                Map.of(
                    "name", request.name().trim(),
                    "email", request.email().trim(),
                    "topic", request.topic().label(),
                    "message", request.message().trim(),
                    "submittedAt", submittedAt.toString()
                )
            );

        emailSender.send(
            new EmailMessage(
                supportProperties.recipient(),
                "[Salif Support] "
                    + request.topic().label(),
                body,
                request.email().trim()
            )
        );
    }
}
