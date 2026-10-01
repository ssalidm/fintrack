package za.co.pixelly.fintrack.identity.application.mfa;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import za.co.pixelly.fintrack.identity.application.exceptions.InvalidMfaCodeException;
import za.co.pixelly.fintrack.identity.domain.MfaRecoveryCode;
import za.co.pixelly.fintrack.identity.domain.UserMfa;
import za.co.pixelly.fintrack.identity.persistence.MfaRecoveryCodeRepository;
import za.co.pixelly.fintrack.identity.persistence.UserMfaRepository;

import java.time.Instant;
import java.util.OptionalLong;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MfaReauthenticationService {

    private final UserMfaRepository userMfaRepository;
    private final MfaRecoveryCodeRepository recoveryCodeRepository;

    private final MfaRecoveryCodeCodec recoveryCodeCodec;
    private final MfaTotpVerifier mfaTotpVerifier;

    @Transactional(propagation = Propagation.MANDATORY)
    public void verifyIfRequired(
        UUID userId,
        String mfaCode,
        Instant now
    ) {
        UserMfa userMfa = userMfaRepository
            .findByUserIdForUpdate(
                userId
            )
            .orElse(null);

        /*
         * MFA is optional.
         *
         * If the user has not enabled MFA,
         * password reauthentication is enough.
         */
        if (userMfa == null || !userMfa.isEnabled()) {
            return;
        }

        if (mfaCode == null || mfaCode.isBlank()) {
            throw new InvalidMfaCodeException();
        }

        if (mfaCode.matches("\\d{6}")) {
            verifyTotp(
                userId,
                userMfa,
                mfaCode,
                now
            );

            return;
        }

        verifyRecoveryCode(
            userId,
            mfaCode,
            now
        );
    }

    private void verifyTotp(
        UUID userId,
        UserMfa userMfa,
        String code,
        Instant now
    ) {
        OptionalLong verifiedTimeStep =
            mfaTotpVerifier.verifyFresh(
                userId,
                userMfa,
                code
            );

        if (verifiedTimeStep.isEmpty()) {
            throw new InvalidMfaCodeException();
        }

        /*
         * The verifier checks freshness but does not
         * mutate the MFA record.
         *
         * This service owns the successful
         * reauthentication mutation.
         */
        userMfa.recordUsedTimeStep(
            verifiedTimeStep.getAsLong(),
            now
        );
    }

    private void verifyRecoveryCode(
        UUID userId,
        String rawRecoveryCode,
        Instant now
    ) {
        String recoveryCodeHash = recoveryCodeCodec.hash(
            rawRecoveryCode
        );

        MfaRecoveryCode recoveryCode = recoveryCodeRepository
            .findUsableForUpdate(
                userId,
                recoveryCodeHash
            )
            .orElseThrow(
                InvalidMfaCodeException::new
            );

        recoveryCode.consume(
            now
        );
    }
}
