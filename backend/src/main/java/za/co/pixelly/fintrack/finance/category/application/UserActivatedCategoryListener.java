package za.co.pixelly.fintrack.finance.category.application;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import za.co.pixelly.fintrack.identity.application.event.UserActivatedEvent;

@Component
@RequiredArgsConstructor
public class UserActivatedCategoryListener {

    private final CategoryProvisioningService categoryProvisioningService;

    @TransactionalEventListener(
        phase = TransactionPhase.BEFORE_COMMIT
    )
    public void onUserActivated(UserActivatedEvent event) {
        categoryProvisioningService
            .provisionDefaults(event.userId());
    }
}
