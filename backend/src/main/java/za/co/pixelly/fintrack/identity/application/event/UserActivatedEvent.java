package za.co.pixelly.fintrack.identity.application.event;

import java.util.UUID;

public record UserActivatedEvent(
    UUID userId
) {
}
