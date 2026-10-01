package za.co.pixelly.fintrack.identity.application;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("!test")
@RequiredArgsConstructor
public class SmtpRegistrationEmailSender
    implements RegistrationEmailSender {

    private final AccountEmailService accountEmailService;

    @Override
    public void sendRegistrationEmail(
        String email,
        String rawToken
    ) {
        accountEmailService
            .sendRegistrationEmail(
                email,
                rawToken
            );
    }
}
