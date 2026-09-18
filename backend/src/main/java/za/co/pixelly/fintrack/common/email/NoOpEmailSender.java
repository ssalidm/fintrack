package za.co.pixelly.fintrack.common.email;


import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(
    prefix = "fintrack.email",
    name = "enabled",
    havingValue = "false",
    matchIfMissing = true
)
public class NoOpEmailSender implements EmailSender {

    @Override
    public void send(
        EmailMessage message
    ) {
        // Intentionally disabled for environments such as tests.
    }
}
