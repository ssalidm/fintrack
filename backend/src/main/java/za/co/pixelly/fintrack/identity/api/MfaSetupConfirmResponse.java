package za.co.pixelly.fintrack.identity.api;

import java.util.List;

public record MfaSetupConfirmResponse(
    List<String> recoveryCodes
) {

    public MfaSetupConfirmResponse {
        recoveryCodes = List.copyOf(recoveryCodes);
    }
}
