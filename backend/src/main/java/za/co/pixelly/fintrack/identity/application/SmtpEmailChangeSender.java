package za.co.pixelly.fintrack.identity.application;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@Profile("!test")
@RequiredArgsConstructor
public class SmtpEmailChangeSender
    implements EmailChangeSender {

    private final AccountEmailService accountEmailService;

    @Override
    public void sendVerificationEmail(
        String email,
        String firstName,
        String rawToken,
        Instant expiresAt
    ) {
        accountEmailService
            .sendEmailChangeVerificationEmail(
                email,
                firstName,
                rawToken
            );
    }
}
