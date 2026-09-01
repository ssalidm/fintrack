package za.co.pixelly.fintrack.identity.application;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@Profile("!test")
@RequiredArgsConstructor
public class SmtpPasswordResetSender implements PasswordResetSender {

    private final AccountEmailService accountEmailService;

    @Override
    public void sendPasswordReset(
        String email,
        String firstName,
        String rawToken,
        Instant expiresAt
    ) {
        accountEmailService.sendPasswordResetEmail(
            email,
            firstName,
            rawToken
        );
    }
}
