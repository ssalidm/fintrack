package za.co.pixelly.fintrack.identity.application.mfa;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import za.co.pixelly.fintrack.identity.domain.UserMfa;

import java.util.Arrays;
import java.util.OptionalLong;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MfaTotpVerifier {

    private final TotpSecretCipher totpSecretCipher;
    private final TotpService totpService;

    public OptionalLong verifyFresh(
        UUID userId,
        UserMfa userMfa,
        String code
    ) {
        EncryptedTotpSecret encryptedSecret =
            new EncryptedTotpSecret(
                userMfa.getTotpSecretCiphertext(),
                userMfa.getTotpSecretIv()
            );

        byte[] rawSecret =
            totpSecretCipher.decrypt(
                userId,
                encryptedSecret
            );

        TotpVerificationResult verification;

        try {
            verification =
                totpService.verify(
                    rawSecret,
                    code
                );
        } finally {
            Arrays.fill(
                rawSecret,
                (byte) 0
            );
        }

        if (!verification.valid()) {
            return OptionalLong.empty();
        }

        OptionalLong timeStep =
            verification.timeStep();

        if (
            timeStep.isEmpty()
                || !userMfa.canUseTimeStep(
                timeStep.getAsLong()
            )
        ) {
            return OptionalLong.empty();
        }

        return timeStep;
    }
}
