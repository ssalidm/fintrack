package za.co.pixelly.fintrack.identity.application;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
public class RegistrationEmailEventListener {

    private final AccountEmailService
        accountEmailService;


    @TransactionalEventListener(
        phase = TransactionPhase.AFTER_COMMIT
    )
    public void handle(
        RegistrationEmailRequested event
    ) {
        accountEmailService
            .sendRegistrationEmail(
                event.email(),
                event.rawToken()
            );
    }
}
