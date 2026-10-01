package za.co.pixelly.fintrack.identity.application.mfa;

import java.util.OptionalLong;

public record TotpVerificationResult(
    boolean valid,
    OptionalLong timeStep
) {

    public static TotpVerificationResult valid(long timeStep) {
        return new TotpVerificationResult(
            true,
            OptionalLong.of(timeStep)
        );
    }

    public static TotpVerificationResult invalid() {
        return new TotpVerificationResult(
            false,
            OptionalLong.empty()
        );
    }
}
