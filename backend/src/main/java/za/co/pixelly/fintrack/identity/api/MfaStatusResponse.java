package za.co.pixelly.fintrack.identity.api;

import java.time.Instant;

public record MfaStatusResponse(
    boolean enabled,
    boolean setupPending,
    Instant enabledAt,
    int remainingRecoveryCodes
) {
}
