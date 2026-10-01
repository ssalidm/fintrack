package za.co.pixelly.fintrack.identity.api;

import java.util.List;

public record MfaRecoveryCodesResponse(
    List<String> recoveryCodes
) {

    public MfaRecoveryCodesResponse {
        recoveryCodes = List.copyOf(recoveryCodes);
    }
}
