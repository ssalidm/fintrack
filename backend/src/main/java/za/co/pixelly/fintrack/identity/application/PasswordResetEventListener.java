package za.co.pixelly.fintrack.identity.application;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
public class PasswordResetEventListener {

    private final PasswordResetSender sender;

    @TransactionalEventListener(
        phase = TransactionPhase.AFTER_COMMIT
    )
    public void handle(PasswordResetRequested event) {

        sender.sendPasswordReset(
            event.email(),
            event.firstName(),
            event.rawToken(),
            event.expiresAt()
        );
    }
}
