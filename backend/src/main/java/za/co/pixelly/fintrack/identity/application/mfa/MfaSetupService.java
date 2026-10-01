package za.co.pixelly.fintrack.identity.application.mfa;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import za.co.pixelly.fintrack.identity.api.MfaSetupConfirmResponse;
import za.co.pixelly.fintrack.identity.api.MfaSetupResponse;
import za.co.pixelly.fintrack.identity.application.exceptions.InvalidMfaCodeException;
import za.co.pixelly.fintrack.identity.application.exceptions.MfaAlreadyEnabledException;
import za.co.pixelly.fintrack.identity.application.exceptions.MfaSetupNotStartedException;
import za.co.pixelly.fintrack.identity.application.exceptions.UserNotFoundException;
import za.co.pixelly.fintrack.identity.domain.MfaRecoveryCode;
import za.co.pixelly.fintrack.identity.domain.User;
import za.co.pixelly.fintrack.identity.domain.UserMfa;
import za.co.pixelly.fintrack.identity.persistence.MfaRecoveryCodeRepository;
import za.co.pixelly.fintrack.identity.persistence.UserMfaRepository;
import za.co.pixelly.fintrack.identity.persistence.UserRepository;

import java.security.InvalidKeyException;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MfaSetupService {

    private final UserRepository userRepository;
    private final UserMfaRepository userMfaRepository;

    private final TotpService totpService;
    private final TotpSecretCipher totpSecretCipher;
    private final MfaRecoveryCodeRepository recoveryCodeRepository;
    private final MfaRecoveryCodeCodec recoveryCodeCodec;

    private final Clock clock;

    @Transactional
    public MfaSetupResponse startSetup(UUID userId) {

        /*
         * Lock the user first.
         *
         * This also serializes concurrent first-time setup
         * attempts where no user_mfa row exists yet.
         */
        User user = userRepository
            .findByIdForUpdate(userId)
            .orElseThrow(UserNotFoundException::new);

        UserMfa existingMfa = userMfaRepository
            .findByUserIdForUpdate(userId)
            .orElse(null);

        if (
            existingMfa != null
                && existingMfa.isEnabled()
        ) {
            throw new MfaAlreadyEnabledException();
        }

        GeneratedTotpSecret generated =
            totpService.generateSecret(
                user.getEmail()
            );

        EncryptedTotpSecret encrypted =
            totpSecretCipher.encrypt(
                userId,
                generated.rawSecret()
            );

        Instant now = clock.instant();

        if (existingMfa == null) {

            UserMfa userMfa =
                UserMfa.startSetup(
                    userId,
                    encrypted.ciphertext(),
                    encrypted.iv(),
                    now
                );

            userMfaRepository.save(userMfa);

        } else {

            /*
             * Starting setup again while still PENDING simply
             * invalidates the previous authenticator secret.
             */
            existingMfa.replacePendingSecret(
                encrypted.ciphertext(),
                encrypted.iv(),
                now
            );
        }

        return new MfaSetupResponse(
            generated.base32Secret(),
            generated.otpAuthUri()
        );
    }


    @Transactional
    public MfaSetupConfirmResponse confirmSetup(
        UUID userId,
        String code
    ) {
        UserMfa userMfa = userMfaRepository
            .findByUserIdForUpdate(userId)
            .orElseThrow(MfaSetupNotStartedException::new);

        if (userMfa.isEnabled()) {
            throw new MfaAlreadyEnabledException();
        }

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

        TotpVerificationResult verification =
            totpService.verify(
                rawSecret,
                code
            );

        if (!verification.valid()) {
            throw new InvalidMfaCodeException();
        }

        Instant now = clock.instant();

        long verifiedTimestamp = verification.timeStep()
            .orElseThrow();

        userMfa.enable(now);

        userMfa.recordUsedTimeStep(
            verifiedTimestamp,
            now
        );

        /*
         * Remove any existing recovery codes from an
         * incomplete/previous setup before issuing new ones.
         */
        recoveryCodeRepository.deleteByUserId(userId);

        List<String> rawRecoveryCodes =
            recoveryCodeCodec.generate();

        List<MfaRecoveryCode> recoveryCodes =
            rawRecoveryCodes.stream()
                .map(rawCode ->
                    MfaRecoveryCode.issue(
                        userId,
                        recoveryCodeCodec.hash(rawCode),
                        now
                    )
                )
                .toList();

        recoveryCodeRepository.saveAll(
            recoveryCodes
        );

        return new MfaSetupConfirmResponse(
            rawRecoveryCodes
        );
    }
}
