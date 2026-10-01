package za.co.pixelly.fintrack.identity.application.mfa;

public record EncryptedTotpSecret(
    byte[] ciphertext,
    byte[] iv
) {

    public EncryptedTotpSecret {
        ciphertext = ciphertext.clone();
        iv = iv.clone();
    }

    @Override
    public byte[] ciphertext() {
        return ciphertext.clone();
    }

    @Override
    public byte[] iv() {
        return iv.clone();
    }
}
