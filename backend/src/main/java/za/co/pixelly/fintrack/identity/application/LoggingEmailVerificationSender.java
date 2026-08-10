package za.co.pixelly.fintrack.identity.application;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Slf4j
@Component
@Profile("local")
public class LoggingEmailVerificationSender
    implements EmailVerificationSender {

    @Override
    public void sendVerificationEmail(
        String email,
        String rawToken,
        Instant expiresAt
    ) {
        log.info(
            """
                LOCAL EMAIL VERIFICATION
                email={}
                token={}
                expiresAt={}
                """,
            email,
            rawToken,
            expiresAt
        );
    }
}
