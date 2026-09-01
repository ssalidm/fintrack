package za.co.pixelly.fintrack.identity.application;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
public class EmailVerificationEventListener {

    private final EmailVerificationSender sender;

    @TransactionalEventListener(
        phase = TransactionPhase.AFTER_COMMIT
    )
    public void handle(
        EmailVerificationRequested event
    ) {
        sender.sendVerificationEmail(
            event.email(),
            event.firstName(),
            event.rawToken(),
            event.expiresAt()
        );
    }
}
