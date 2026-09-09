package za.co.pixelly.fintrack.identity.application.mfa;

import com.eatthepath.otp.TimeBasedOneTimePasswordGenerator;
import org.apache.commons.codec.binary.Base32;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;
import za.co.pixelly.fintrack.config.security.MfaProperties;

import javax.crypto.KeyGenerator;
import javax.crypto.Mac;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.security.GeneralSecurityException;
import java.security.InvalidKeyException;
import java.time.Clock;
import java.time.Instant;

@Service
public class TotpService {

    private static final int CODE_LENGTH = 6;
    private static final int CLOCK_DRIFT_STEPS = 1;

    private final TimeBasedOneTimePasswordGenerator generator;
    private final Base32 base32;
    private final Clock clock;
    private final MfaProperties properties;

    public TotpService(
        Clock clock,
        MfaProperties properties
    ) {
        this.generator =
            new TimeBasedOneTimePasswordGenerator();

        this.base32 = new Base32();
        this.clock = clock;
        this.properties = properties;
    }

    public GeneratedTotpSecret generateSecret(
        String accountName
    ) {
        SecretKey secretKey = generateSecretKey();

        byte[] rawSecret = secretKey.getEncoded();

        String base32Secret =
            base32.encodeToString(rawSecret)
                .replace("=", "");

        String otpAuthUri = buildOtpAuthUri(
            accountName,
            base32Secret
        );

        return new GeneratedTotpSecret(
            rawSecret,
            base32Secret,
            otpAuthUri
        );
    }

    public TotpVerificationResult verify(
        byte[] rawSecret,
        String code
    ) {
        if (code == null || !code.matches("\\d{6}")) {
            return TotpVerificationResult.invalid();
        }

        int numericCode = Integer.parseInt(code);

        SecretKey key = new SecretKeySpec(
            rawSecret,
            generator.getAlgorithm()
        );

        Instant now = clock.instant();

        long stepSeconds =
            generator.getTimeStep().toSeconds();

        long currentStep =
            Math.floorDiv(
                now.getEpochSecond(),
                stepSeconds
            );

        try {
            for (
                long step = currentStep - CLOCK_DRIFT_STEPS;
                step <= currentStep + CLOCK_DRIFT_STEPS;
                step++
            ) {
                Instant candidateTime =
                    Instant.ofEpochSecond(
                        step * stepSeconds
                    );

                if (
                    generator.validateOneTimePassword(
                        key,
                        candidateTime,
                        numericCode
                    )
                ) {
                    return TotpVerificationResult.valid(step);
                }
            }

            return TotpVerificationResult.invalid();

        } catch (InvalidKeyException exception) {
            throw new IllegalStateException(
                "Unable to validate TOTP code",
                exception
            );
        }
    }

    private SecretKey generateSecretKey() {
        try {
            String algorithm = generator.getAlgorithm();

            KeyGenerator keyGenerator =
                KeyGenerator.getInstance(algorithm);

            int macLengthBytes =
                Mac.getInstance(algorithm)
                    .getMacLength();

            keyGenerator.init(
                macLengthBytes * 8
            );

            return keyGenerator.generateKey();

        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException(
                "Unable to generate TOTP secret",
                exception
            );
        }
    }

    private String buildOtpAuthUri(
        String accountName,
        String secret
    ) {
        String issuer = properties.issuer();

        return UriComponentsBuilder
            .newInstance()
            .scheme("otpauth")
            .host("totp")
            .pathSegment(
                issuer + ":" + accountName
            )
            .queryParam(
                "secret",
                secret
            )
            .queryParam(
                "issuer",
                issuer
            )
            .queryParam(
                "algorithm",
                "SHA1"
            )
            .queryParam(
                "digits",
                CODE_LENGTH
            )
            .queryParam(
                "period",
                generator
                    .getTimeStep()
                    .toSeconds()
            )
            .build()
            .encode()
            .toUriString();
    }
}
