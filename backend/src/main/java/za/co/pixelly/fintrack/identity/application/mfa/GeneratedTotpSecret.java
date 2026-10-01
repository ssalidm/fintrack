package za.co.pixelly.fintrack.identity.application.mfa;

public record GeneratedTotpSecret(
    byte[] rawSecret,
    String base32Secret,
    String otpAuthUri
) {

    public GeneratedTotpSecret {
        rawSecret = rawSecret.clone();
    }

    @Override
    public byte[] rawSecret() {
        return rawSecret.clone();
    }
}
