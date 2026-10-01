package za.co.pixelly.fintrack.identity.application;

import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import za.co.pixelly.fintrack.config.security.PasswordResetProperties;
import za.co.pixelly.fintrack.identity.application.exceptions.InvalidPasswordResetTokenException;
import za.co.pixelly.fintrack.identity.domain.PasswordResetToken;
import za.co.pixelly.fintrack.identity.domain.User;
import za.co.pixelly.fintrack.identity.persistence.AuthSessionRepository;
import za.co.pixelly.fintrack.identity.persistence.PasswordResetTokenRepository;
import za.co.pixelly.fintrack.identity.persistence.RefreshTokenRepository;
import za.co.pixelly.fintrack.identity.persistence.UserRepository;

import java.time.Clock;
import java.time.Instant;

import static za.co.pixelly.fintrack.identity.application.EmailAddressNormalizer.normalize;


@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private static final String PASSWORD_RESET_REASON = "PASSWORD_RESET";

    private final PasswordResetTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final AuthSessionRepository sessionRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    private final OpaqueTokenCodec tokenCodec;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetProperties properties;

    private final ApplicationEventPublisher eventPublisher;
    private final Clock applicationClock;


    @Transactional
    public void requestReset(String email) {
        userRepository
            .findByEmail(normalize(email))
            .filter(User::isPasswordResetEligible)
            .ifPresent(this::issueToken);
    }

    @Transactional
    public void resetPassword(
        String rawToken,
        String newPassword
    ) {
        Instant now = applicationClock.instant();

        String tokenHash =
            tokenCodec.hash(rawToken);

        PasswordResetToken token =
            tokenRepository
                .findByTokenHashForUpdate(tokenHash)
                .orElseThrow(
                    InvalidPasswordResetTokenException::new
                );

        if (!token.isUsable(now)) {
            throw new InvalidPasswordResetTokenException();
        }

        User user = userRepository
            .findById(token.getUserId())
            .orElseThrow(
                InvalidPasswordResetTokenException::new
            );

        if (!user.isPasswordResetEligible()) {
            throw new InvalidPasswordResetTokenException();
        }

        String newPasswordHash =
            passwordEncoder.encode(newPassword);

        token.consume(now);

        user.resetPassword(
            newPasswordHash,
            now
        );

        refreshTokenRepository.revokeActiveByUserId(
            user.getId(),
            now,
            PASSWORD_RESET_REASON
        );

        sessionRepository.revokeActiveByUserId(
            user.getId(),
            now,
            PASSWORD_RESET_REASON
        );
    }

    private void issueToken(User user) {

        Instant now = applicationClock.instant();

        tokenRepository
            .findActiveByUserIdForUpdate(user.getId())
            .ifPresent(existingToken -> {
                existingToken.invalidate(now);

                /*
                 * Required because the database permits only one
                 * active password-reset token per user.
                 */
                tokenRepository.flush();
            });

        String rawToken =
            tokenCodec.generate();

        String tokenHash =
            tokenCodec.hash(rawToken);

        Instant expiresAt =
            now.plus(properties.tokenTtl());

        PasswordResetToken newToken =
            PasswordResetToken.issue(
                user.getId(),
                tokenHash,
                now,
                expiresAt
            );

        tokenRepository.saveAndFlush(newToken);

        eventPublisher.publishEvent(
            new PasswordResetRequested(
                user.getEmail(),
                user.getFirstName(),
                rawToken,
                expiresAt
            )
        );
    }
}
