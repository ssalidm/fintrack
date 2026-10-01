package za.co.pixelly.fintrack.identity.application;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
public class RegistrationEmailEventListener {

    private final RegistrationEmailSender registrationEmailSender;


    @TransactionalEventListener(
        phase = TransactionPhase.AFTER_COMMIT
    )
    public void handle(
        RegistrationEmailRequested event
    ) {
        registrationEmailSender
            .sendRegistrationEmail(
                event.email(),
                event.rawToken()
            );
    }
}
