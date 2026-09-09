package za.co.pixelly.fintrack.identity.application.mfa;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import za.co.pixelly.fintrack.identity.api.MfaRecoveryCodesResponse;
import za.co.pixelly.fintrack.identity.api.MfaStatusResponse;
import za.co.pixelly.fintrack.identity.application.exceptions.InvalidCurrentPasswordException;
import za.co.pixelly.fintrack.identity.application.exceptions.InvalidMfaCodeException;
import za.co.pixelly.fintrack.identity.application.exceptions.MfaNotEnabledException;
import za.co.pixelly.fintrack.identity.application.exceptions.UserProfileNotFoundException;
import za.co.pixelly.fintrack.identity.domain.MfaRecoveryCode;
import za.co.pixelly.fintrack.identity.domain.User;
import za.co.pixelly.fintrack.identity.domain.UserMfa;
import za.co.pixelly.fintrack.identity.persistence.MfaLoginChallengeRepository;
import za.co.pixelly.fintrack.identity.persistence.MfaRecoveryCodeRepository;
import za.co.pixelly.fintrack.identity.persistence.UserMfaRepository;
import za.co.pixelly.fintrack.identity.persistence.UserRepository;

import java.time.Clock;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MfaManagementService {

    private final UserMfaRepository userMfaRepository;
    private final MfaRecoveryCodeRepository recoveryCodeRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private final TotpSecretCipher totpSecretCipher;
    private final TotpService totpService;
    private final MfaRecoveryCodeCodec recoveryCodeCodec;

    private final MfaLoginChallengeRepository challengeRepository;

    private final Clock clock;

    @Transactional(readOnly = true)
    public MfaStatusResponse status(
        UUID userId
    ) {
        return userMfaRepository
            .findById(userId)
            .map(userMfa ->
                response(
                    userId,
                    userMfa
                )
            )
            .orElseGet(() ->
                new MfaStatusResponse(
                    false,
                    false,
                    null,
                    0
                )
            );
    }


    @Transactional
    public void disable(
        UUID userId,
        String currentPassword,
        String mfaCode
    ) {
        Instant now =
            clock.instant();

        User user =
            userRepository
                .findByIdForUpdate(userId)
                .orElseThrow(
                    UserProfileNotFoundException::new
                );

        /*
         * A stolen access token alone must not be enough
         * to remove the user's second factor.
         */
        if (!passwordEncoder.matches(
            currentPassword,
            user.getPasswordHash()
        )) {
            throw new InvalidCurrentPasswordException();
        }

        UserMfa userMfa =
            userMfaRepository
                .findByUserIdForUpdate(userId)
                .filter(UserMfa::isEnabled)
                .orElseThrow(
                    MfaNotEnabledException::new
                );

        boolean validFactor;

        if (mfaCode.matches("\\d{6}")) {
            validFactor =
                verifyTotp(
                    userId,
                    userMfa,
                    mfaCode
                );
        } else {
            validFactor =
                verifyRecoveryCode(
                    userId,
                    mfaCode
                );
        }

        if (!validFactor) {
            throw new InvalidMfaCodeException();
        }

        /*
         * Any outstanding password-authenticated MFA
         * challenges must immediately become unusable.
         */
        challengeRepository
            .findActiveByUserIdForUpdate(userId)
            .forEach(
                challenge ->
                    challenge.invalidate(now)
            );

        /*
         * Recovery codes have no meaning once MFA has
         * been disabled.
         */
        recoveryCodeRepository
            .deleteByUserId(userId);

        /*
         * There is intentionally no DISABLED row state.
         * Absence of user_mfa means MFA is not configured.
         */
        userMfaRepository.delete(
            userMfa
        );
    }

    @Transactional
    public MfaRecoveryCodesResponse regenerateRecoveryCodes(
        UUID userId,
        String currentPassword,
        String code
    ) {
        Instant now =
            clock.instant();

        User user =
            userRepository
                .findByIdForUpdate(userId)
                .orElseThrow(
                    UserProfileNotFoundException::new
                );

        if (!passwordEncoder.matches(
            currentPassword,
            user.getPasswordHash()
        )) {
            throw new InvalidCurrentPasswordException();
        }

        UserMfa userMfa =
            userMfaRepository
                .findByUserIdForUpdate(userId)
                .filter(UserMfa::isEnabled)
                .orElseThrow(
                    MfaNotEnabledException::new
                );

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
            throw new InvalidMfaCodeException();
        }

        long verifiedTimeStep =
            verification.timeStep()
                .orElseThrow();

        /*
         * A TOTP successfully used for another sensitive
         * operation must not be reusable here.
         */
        if (!userMfa.canUseTimeStep(
            verifiedTimeStep
        )) {
            throw new InvalidMfaCodeException();
        }

        userMfa.recordUsedTimeStep(
            verifiedTimeStep,
            now
        );

        /*
         * Rotation means every previous recovery code,
         * whether used or unused, becomes invalid.
         */
        recoveryCodeRepository.deleteByUserId(
            userId
        );

        List<String> rawRecoveryCodes =
            recoveryCodeCodec.generate();

        List<MfaRecoveryCode> recoveryCodes =
            rawRecoveryCodes.stream()
                .map(rawCode ->
                    MfaRecoveryCode.issue(
                        userId,
                        recoveryCodeCodec.hash(
                            rawCode
                        ),
                        now
                    )
                )
                .toList();

        recoveryCodeRepository.saveAll(
            recoveryCodes
        );

        return new MfaRecoveryCodesResponse(
            rawRecoveryCodes
        );
    }


    private MfaStatusResponse response(
        UUID userId,
        UserMfa userMfa
    ) {
        boolean enabled = userMfa.isEnabled();

        long remainingRecoveryCodes =
            enabled
                ? recoveryCodeRepository
                .countByUserIdAndUsedAtIsNull(
                    userId
                )
                : 0;

        return new MfaStatusResponse(
            enabled,
            userMfa.isPending(),
            userMfa.getEnabledAt(),
            Math.toIntExact(
                remainingRecoveryCodes
            )
        );
    }

    private boolean verifyTotp(
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

        try {
            TotpVerificationResult verification =
                totpService.verify(
                    rawSecret,
                    code
                );

            if (!verification.valid()) {
                return false;
            }

            long timeStep =
                verification.timeStep()
                    .orElseThrow();

            return userMfa.canUseTimeStep(
                timeStep
            );
        } finally {
            Arrays.fill(
                rawSecret,
                (byte) 0
            );
        }
    }

    private boolean verifyRecoveryCode(
        UUID userId,
        String rawCode
    ) {
        String codeHash =
            recoveryCodeCodec.hash(
                rawCode
            );

        return recoveryCodeRepository
            .findUsableForUpdate(
                userId,
                codeHash
            )
            .isPresent();
    }
}
