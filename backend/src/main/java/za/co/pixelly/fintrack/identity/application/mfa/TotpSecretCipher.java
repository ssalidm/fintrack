package za.co.pixelly.fintrack.identity.application.mfa;

import org.springframework.stereotype.Component;
import za.co.pixelly.fintrack.config.security.MfaProperties;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Objects;
import java.util.UUID;

@Component
public class TotpSecretCipher {

    private static final String CIPHER_ALGORITHM =
        "AES/GCM/NoPadding";

    private static final int AES_256_KEY_LENGTH = 32;
    private static final int IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH_BITS = 128;

    private final SecretKey encryptionKey;
    private final SecureRandom secureRandom = new SecureRandom();

    public TotpSecretCipher(MfaProperties properties) {
        this.encryptionKey = decodeKey(
            properties.encryptionKey()
        );
    }

    public EncryptedTotpSecret encrypt(
        UUID userId,
        byte[] secret
    ) {
        Objects.requireNonNull(userId, "userId is required");
        Objects.requireNonNull(secret, "secret is required");

        byte[] iv = new byte[IV_LENGTH];
        secureRandom.nextBytes(iv);

        try {
            Cipher cipher =
                Cipher.getInstance(CIPHER_ALGORITHM);

            cipher.init(
                Cipher.ENCRYPT_MODE,
                encryptionKey,
                new GCMParameterSpec(
                    GCM_TAG_LENGTH_BITS,
                    iv
                )
            );

            cipher.updateAAD(
                aad(userId)
            );

            byte[] ciphertext =
                cipher.doFinal(secret);

            return new EncryptedTotpSecret(
                ciphertext,
                iv
            );

        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException(
                "Unable to encrypt TOTP secret",
                exception
            );
        }
    }

    public byte[] decrypt(
        UUID userId,
        EncryptedTotpSecret encryptedSecret
    ) {
        Objects.requireNonNull(userId, "userId is required");
        Objects.requireNonNull(
            encryptedSecret,
            "encryptedSecret is required"
        );

        try {
            Cipher cipher =
                Cipher.getInstance(CIPHER_ALGORITHM);

            cipher.init(
                Cipher.DECRYPT_MODE,
                encryptionKey,
                new GCMParameterSpec(
                    GCM_TAG_LENGTH_BITS,
                    encryptedSecret.iv()
                )
            );

            cipher.updateAAD(
                aad(userId)
            );

            return cipher.doFinal(
                encryptedSecret.ciphertext()
            );

        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException(
                "Unable to decrypt TOTP secret",
                exception
            );
        }
    }

    private SecretKey decodeKey(String encodedKey) {
        if (encodedKey == null || encodedKey.isBlank()) {
            throw new IllegalStateException(
                "MFA encryption key is required"
            );
        }

        final byte[] keyBytes;

        try {
            keyBytes = Base64
                .getDecoder()
                .decode(encodedKey);
        } catch (IllegalArgumentException exception) {
            throw new IllegalStateException(
                "MFA encryption key must be valid Base64",
                exception
            );
        }

        if (keyBytes.length != AES_256_KEY_LENGTH) {
            throw new IllegalStateException(
                "MFA encryption key must be exactly 256 bits"
            );
        }

        return new SecretKeySpec(
            keyBytes,
            "AES"
        );
    }

    private byte[] aad(UUID userId) {
        return userId
            .toString()
            .getBytes(StandardCharsets.UTF_8);
    }
}
