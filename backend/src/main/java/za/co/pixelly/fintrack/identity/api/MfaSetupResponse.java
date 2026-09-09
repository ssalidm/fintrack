package za.co.pixelly.fintrack.identity.api;

public record MfaSetupResponse(
    String manualEntryKey,
    String otpAuthUri
) {
}
