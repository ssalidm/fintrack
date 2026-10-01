package za.co.pixelly.fintrack.identity.application.mfa;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import za.co.pixelly.fintrack.config.security.MfaProperties;
import za.co.pixelly.fintrack.identity.application.OpaqueTokenCodec;
import za.co.pixelly.fintrack.identity.application.exceptions.InvalidMfaAuthenticationException;
import za.co.pixelly.fintrack.identity.application.exceptions.MfaRateLimitExceededException;
import za.co.pixelly.fintrack.identity.domain.MfaLoginChallenge;
import za.co.pixelly.fintrack.identity.domain.UserMfa;
import za.co.pixelly.fintrack.identity.persistence.MfaLoginChallengeRepository;
import za.co.pixelly.fintrack.identity.persistence.UserMfaRepository;

import java.time.Clock;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MfaChallengeService {

    private final MfaLoginChallengeRepository challengeRepository;
    private final UserMfaRepository userMfaRepository;
    private final OpaqueTokenCodec tokenCodec;
    private final MfaProperties properties;
    private final Clock clock;

    @Transactional
    public IssuedMfaChallenge issue(
        UUID userId,
        String userAgent
    ) {
        Instant now = clock.instant();

        /*
         * Challenges are useful only for a few minutes.
         * Keep expired rows for 24 hours for short-term
         * diagnostics, then remove them opportunistically.
         */
        challengeRepository.deleteExpiredBefore(
            now.minus(
                properties.challengeRetentionDuration()
            )
        );

        UserMfa userMfa =
            userMfaRepository
                .findByUserIdForUpdate(userId)
                .filter(UserMfa::isEnabled)
                .orElseThrow(
                    InvalidMfaAuthenticationException::new
                );

        if (userMfa.isTemporarilyLocked(now)) {
            throw new MfaRateLimitExceededException();
        }

        /*
         * Only the newest password-authenticated MFA
         * challenge should remain usable.
         */
        challengeRepository
            .findActiveByUserIdForUpdate(userId)
            .forEach(
                challenge ->
                    challenge.invalidate(now)
            );

        String rawToken =
            tokenCodec.generate();

        Instant expiresAt =
            now.plus(
                properties.challengeTtl()
            );

        MfaLoginChallenge challenge =
            MfaLoginChallenge.issue(
                userId,
                tokenCodec.hash(rawToken),
                userAgent,
                now,
                expiresAt
            );

        challengeRepository.saveAndFlush(
            challenge
        );

        return new IssuedMfaChallenge(
            rawToken,
            expiresAt
        );
    }
}
