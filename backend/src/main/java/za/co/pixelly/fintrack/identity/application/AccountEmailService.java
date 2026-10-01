package za.co.pixelly.fintrack.identity.application;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;
import za.co.pixelly.fintrack.common.email.EmailMessage;
import za.co.pixelly.fintrack.common.email.EmailSender;
import za.co.pixelly.fintrack.common.email.EmailTemplateRenderer;
import za.co.pixelly.fintrack.config.email.EmailProperties;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AccountEmailService {

    private static final String REGISTRATION_TEMPLATE = "email/registration";
    private static final String VERIFICATION_TEMPLATE = "email/verification";
    private static final String PASSWORD_RESET_TEMPLATE = "email/password-reset";
    private static final String EMAIL_CHANGE_TEMPLATE = "email/email-change-verification";

    private static final String REGISTRATION_SUBJECT = "Finish creating your Salif account";
    private static final String VERIFICATION_SUBJECT = "Verify your Salif email";
    private static final String PASSWORD_RESET_SUBJECT = "Reset your Salif password";
    private static final String EMAIL_CHANGE_SUBJECT = "Confirm your new email address";

    private final EmailSender emailSender;
    private final EmailTemplateRenderer emailTemplateRenderer;
    private final EmailProperties emailProperties;


    public void sendRegistrationEmail(
        String recipient,
        String rawToken
    ) {
        String registrationUrl =
            UriComponentsBuilder
                .fromUriString(
                    emailProperties
                        .frontendBaseUrl()
                )
                .pathSegment(
                    "register",
                    "complete"
                )
                .queryParam(
                    "token",
                    rawToken
                )
                .build()
                .encode()
                .toUriString();

        String body =
            emailTemplateRenderer.render(
                REGISTRATION_TEMPLATE,
                Map.of("registrationUrl", registrationUrl)
            );

        emailSender.send(
            new EmailMessage(
                recipient,
                REGISTRATION_SUBJECT,
                body
            )
        );
    }

    public void sendVerificationEmail(
        String recipient,
        String firstName,
        String rawToken
    ) {
        String verificationUrl =
            buildTokenUrl(
                "verify-email",
                rawToken
            );

        String body =
            emailTemplateRenderer.render(
                VERIFICATION_TEMPLATE,
                Map.of(
                    "firstName", firstName,
                    "verificationUrl", verificationUrl
                )
            );

        emailSender.send(
            new EmailMessage(
                recipient,
                VERIFICATION_SUBJECT,
                body
            )
        );
    }


    public void sendPasswordResetEmail(
        String recipient,
        String firstName,
        String rawToken
    ) {
        String resetUrl =
            buildTokenUrl(
                "reset-password",
                rawToken
            );

        String body =
            emailTemplateRenderer.render(
                PASSWORD_RESET_TEMPLATE,
                Map.of(
                    "firstName", firstName,
                    "resetUrl", resetUrl,
                    "supportUrl", emailProperties.supportUrl()
                )
            );

        emailSender.send(
            new EmailMessage(
                recipient,
                PASSWORD_RESET_SUBJECT,
                body
            )
        );
    }


    public void sendEmailChangeVerificationEmail(
        String recipient,
        String firstName,
        String rawToken
    ) {
        String verificationUrl =
            buildTokenUrl(
                "verify-email-change",
                rawToken
            );

        String body =
            emailTemplateRenderer.render(
                EMAIL_CHANGE_TEMPLATE,
                Map.of(
                    "firstName", firstName,
                    "verificationUrl", verificationUrl
                )
            );

        emailSender.send(
            new EmailMessage(
                recipient,
                EMAIL_CHANGE_SUBJECT,
                body
            )
        );
    }


    private String buildTokenUrl(
        String pathSegment,
        String rawToken
    ) {
        return UriComponentsBuilder
            .fromUriString(emailProperties.frontendBaseUrl())
            .pathSegment(pathSegment)
            .queryParam("token", rawToken)
            .build()
            .encode()
            .toUriString();
    }
}
