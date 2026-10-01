package za.co.pixelly.fintrack.unit.identity.application.mfa;

import com.eatthepath.otp.TimeBasedOneTimePasswordGenerator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import za.co.pixelly.fintrack.config.security.MfaProperties;
import za.co.pixelly.fintrack.identity.application.mfa.GeneratedTotpSecret;
import za.co.pixelly.fintrack.identity.application.mfa.TotpService;
import za.co.pixelly.fintrack.identity.application.mfa.TotpVerificationResult;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.security.InvalidKeyException;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;

import static org.junit.jupiter.api.Assertions.*;

class TotpServiceTest {

    private static final Instant NOW =
        Instant.parse("2026-09-07T12:00:00Z");

    private Clock clock;
    private MfaProperties properties;
    private TotpService service;

    @BeforeEach
    void setUp() {
        clock = Clock.fixed(
            NOW,
            ZoneOffset.UTC
        );

        properties = new MfaProperties(
            "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
            "reko",
            Duration.ofMinutes(5),
            Duration.ofHours(24),
            5,
            Duration.ofMinutes(15)

        );

        service = new TotpService(
            clock,
            properties
        );
    }

    @Test
    void generatesAuthenticatorSetup() {
        GeneratedTotpSecret generated =
            service.generateSecret(
                "david@example.com"
            );

        assertNotNull(generated.rawSecret());
        assertTrue(generated.rawSecret().length > 0);

        assertNotNull(generated.base32Secret());
        assertFalse(generated.base32Secret().isBlank());

        assertTrue(
            generated.otpAuthUri()
                .startsWith("otpauth://totp/")
        );

        assertTrue(
            generated.otpAuthUri()
                .contains("issuer=reko")
        );

        assertTrue(
            generated.otpAuthUri()
                .contains("digits=6")
        );

        assertTrue(
            generated.otpAuthUri()
                .contains("period=30")
        );
    }

    @Test
    void verifiesValidCurrentCode()
        throws Exception {

        GeneratedTotpSecret generated =
            service.generateSecret(
                "david@example.com"
            );

        TimeBasedOneTimePasswordGenerator generator =
            new TimeBasedOneTimePasswordGenerator();

        SecretKey key =
            new SecretKeySpec(
                generated.rawSecret(),
                generator.getAlgorithm()
            );

        String code =
            generator.generateOneTimePasswordString(
                key,
                NOW
            );

        TotpVerificationResult result =
            service.verify(
                generated.rawSecret(),
                code
            );

        assertTrue(result.valid());
        assertTrue(result.timeStep().isPresent());
    }

    @Test
    void rejectsInvalidCode() {
        GeneratedTotpSecret generated =
            service.generateSecret(
                "david@example.com"
            );

        TotpVerificationResult result =
            service.verify(
                generated.rawSecret(),
                "999999"
            );

        assertFalse(result.valid());
        assertTrue(result.timeStep().isEmpty());
    }

    @Test
    void rejectsMalformedCode() {
        GeneratedTotpSecret generated =
            service.generateSecret(
                "david@example.com"
            );

        assertFalse(
            service.verify(
                generated.rawSecret(),
                "12345"
            ).valid()
        );

        assertFalse(
            service.verify(
                generated.rawSecret(),
                "abcdef"
            ).valid()
        );
    }
}
