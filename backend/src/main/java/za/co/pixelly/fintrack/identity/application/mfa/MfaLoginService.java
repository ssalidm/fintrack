package za.co.pixelly.fintrack.identity.application.mfa;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import za.co.pixelly.fintrack.config.security.MfaProperties;
import za.co.pixelly.fintrack.identity.api.TokenResponse;
import za.co.pixelly.fintrack.identity.application.AuthenticatedSessionService;
import za.co.pixelly.fintrack.identity.application.OpaqueTokenCodec;
import za.co.pixelly.fintrack.identity.application.exceptions.InvalidMfaAuthenticationException;
import za.co.pixelly.fintrack.identity.application.exceptions.MfaRateLimitExceededException;
import za.co.pixelly.fintrack.identity.domain.MfaLoginChallenge;
import za.co.pixelly.fintrack.identity.domain.MfaRecoveryCode;
import za.co.pixelly.fintrack.identity.domain.User;
import za.co.pixelly.fintrack.identity.domain.UserMfa;
import za.co.pixelly.fintrack.identity.persistence.MfaLoginChallengeRepository;
import za.co.pixelly.fintrack.identity.persistence.MfaRecoveryCodeRepository;
import za.co.pixelly.fintrack.identity.persistence.UserMfaRepository;
import za.co.pixelly.fintrack.identity.persistence.UserRepository;

import java.time.Clock;
import java.time.Instant;
import java.util.OptionalLong;

@Service
@RequiredArgsConstructor
public class MfaLoginService {

    private final MfaLoginChallengeRepository challengeRepository;
    private final MfaRecoveryCodeRepository recoveryCodeRepository;
    private final UserMfaRepository userMfaRepository;
    private final UserRepository userRepository;

    private final OpaqueTokenCodec tokenCodec;
    private final MfaRecoveryCodeCodec recoveryCodeCodec;
    private final MfaTotpVerifier mfaTotpVerifier;

    private final AuthenticatedSessionService authenticatedSessionService;

    private final MfaProperties properties;
    private final Clock clock;

    @Transactional(
        noRollbackFor =
            InvalidMfaAuthenticationException.class
    )
    public TokenResponse verify(
        String rawChallengeToken,
        String code
    ) {
        MfaChallengeContext context =
            loadChallengeContext(
                rawChallengeToken
            );

        Instant now =
            context.now();

        MfaLoginChallenge challenge =
            context.challenge();

        UserMfa userMfa =
            context.userMfa();

        OptionalLong verifiedTimeStep =
            mfaTotpVerifier.verifyFresh(
                challenge.getUserId(),
                userMfa,
                code
            );

        if (verifiedTimeStep.isEmpty()) {
            failAuthentication(
                challenge,
                userMfa,
                now
            );
        }

        User user =
            loadAuthenticatableUser(
                challenge,
                now
            );

        userMfa.recordUsedTimeStep(
            verifiedTimeStep.getAsLong(),
            now
        );

        userMfa.clearAuthenticationFailures(
            now
        );

        challenge.consume(
            now
        );

        return authenticatedSessionService.issue(
            user,
            challenge.getUserAgent(),
            now
        );
    }

    @Transactional(
        noRollbackFor =
            InvalidMfaAuthenticationException.class
    )
    public TokenResponse recover(
        String rawChallengeToken,
        String rawRecoveryCode
    ) {
        MfaChallengeContext context =
            loadChallengeContext(
                rawChallengeToken
            );

        Instant now =
            context.now();

        MfaLoginChallenge challenge =
            context.challenge();

        UserMfa userMfa =
            context.userMfa();

        String recoveryCodeHash =
            recoveryCodeCodec.hash(
                rawRecoveryCode
            );

        MfaRecoveryCode recoveryCode =
            recoveryCodeRepository
                .findUsableForUpdate(
                    challenge.getUserId(),
                    recoveryCodeHash
                )
                .orElse(null);

        if (recoveryCode == null) {
            failAuthentication(
                challenge,
                userMfa,
                now
            );
        }

        User user =
            loadAuthenticatableUser(
                challenge,
                now
            );

        recoveryCode.consume(
            now
        );

        userMfa.clearAuthenticationFailures(
            now
        );

        challenge.consume(
            now
        );

        return authenticatedSessionService.issue(
            user,
            challenge.getUserAgent(),
            now
        );
    }

    private MfaChallengeContext loadChallengeContext(
        String rawChallengeToken
    ) {
        Instant now =
            clock.instant();

        String challengeHash =
            tokenCodec.hash(
                rawChallengeToken
            );

        MfaLoginChallenge challenge =
            challengeRepository
                .findByTokenHashForUpdate(
                    challengeHash
                )
                .orElseThrow(
                    InvalidMfaAuthenticationException::new
                );

        if (!challenge.isUsable(
            now,
            properties.maxAttempts()
        )) {
            throw new InvalidMfaAuthenticationException();
        }

        UserMfa userMfa =
            userMfaRepository
                .findByUserIdForUpdate(
                    challenge.getUserId()
                )
                .filter(
                    UserMfa::isEnabled
                )
                .orElseThrow(
                    InvalidMfaAuthenticationException::new
                );

        if (userMfa.isTemporarilyLocked(
            now
        )) {
            throw new MfaRateLimitExceededException();
        }

        return new MfaChallengeContext(
            now,
            challenge,
            userMfa
        );
    }

    private User loadAuthenticatableUser(
        MfaLoginChallenge challenge,
        Instant now
    ) {
        return userRepository
            .findByIdForUpdate(
                challenge.getUserId()
            )
            .filter(
                user ->
                    user.canAuthenticate(
                        now
                    )
            )
            .orElseThrow(
                InvalidMfaAuthenticationException::new
            );
    }

    private void failAuthentication(
        MfaLoginChallenge challenge,
        UserMfa userMfa,
        Instant now
    ) {
        challenge.recordFailedAttempt(
            now,
            properties.maxAttempts()
        );

        userMfa.recordFailedAuthentication(
            now,
            properties.maxAttempts(),
            properties.lockoutDuration()
        );

        if (userMfa.isTemporarilyLocked(
            now
        )) {
            challenge.invalidate(
                now
            );
        }

        throw new InvalidMfaAuthenticationException();
    }

    private record MfaChallengeContext(
        Instant now,
        MfaLoginChallenge challenge,
        UserMfa userMfa
    ) {
    }
}
