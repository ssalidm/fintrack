package za.co.pixelly.fintrack.unit.identity.application.mfa;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import za.co.pixelly.fintrack.config.security.MfaProperties;
import za.co.pixelly.fintrack.identity.application.mfa.EncryptedTotpSecret;
import za.co.pixelly.fintrack.identity.application.mfa.TotpSecretCipher;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class TotpSecretCipherTest {

    private TotpSecretCipher cipher;

    @BeforeEach
    void setUp() {
        String encryptionKey =
            Base64.getEncoder()
                .encodeToString(new byte[32]);

        MfaProperties properties =
            new MfaProperties(
                encryptionKey,
                "salif",
                Duration.ofMinutes(5),
                Duration.ofHours(24),
                5,
                Duration.ofMinutes(15)
            );

        cipher = new TotpSecretCipher(properties);
    }

    @Test
    void encryptsAndDecryptsSecret() {
        UUID userId = UUID.randomUUID();

        byte[] original =
            "test-totp-secret"
                .getBytes(StandardCharsets.UTF_8);

        EncryptedTotpSecret encrypted =
            cipher.encrypt(
                userId,
                original
            );

        assertNotNull(encrypted.ciphertext());
        assertNotNull(encrypted.iv());

        assertFalse(
            java.util.Arrays.equals(
                original,
                encrypted.ciphertext()
            )
        );

        byte[] decrypted =
            cipher.decrypt(
                userId,
                encrypted
            );

        assertArrayEquals(
            original,
            decrypted
        );
    }

    @Test
    void cannotDecryptSecretForAnotherUser() {
        UUID ownerId = UUID.randomUUID();
        UUID otherUserId = UUID.randomUUID();

        EncryptedTotpSecret encrypted =
            cipher.encrypt(
                ownerId,
                "secret".getBytes(StandardCharsets.UTF_8)
            );

        assertThrows(
            IllegalStateException.class,
            () -> cipher.decrypt(
                otherUserId,
                encrypted
            )
        );
    }
}
