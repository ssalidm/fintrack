package za.co.pixelly.fintrack.identity.application;

import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import za.co.pixelly.fintrack.common.exception.InvalidEmailVerificationTokenException;
import za.co.pixelly.fintrack.config.security.EmailVerificationProperties;
import za.co.pixelly.fintrack.identity.application.event.UserActivatedEvent;
import za.co.pixelly.fintrack.identity.domain.EmailVerificationToken;
import za.co.pixelly.fintrack.identity.domain.User;
import za.co.pixelly.fintrack.identity.persistence.EmailVerificationTokenRepository;
import za.co.pixelly.fintrack.identity.persistence.UserRepository;

import java.time.Instant;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private final EmailVerificationTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final OpaqueTokenCodec tokenCodec;
    private final EmailVerificationProperties properties;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public void issueFor(User user) {
        issueToken(user);
    }

    @Transactional
    public void verify(String rawToken) {

        Instant now = Instant.now();

        String tokenHash =
            tokenCodec.hash(rawToken);

        EmailVerificationToken token = tokenRepository
                .findByTokenHashForUpdate(tokenHash)
                .orElseThrow(
                    InvalidEmailVerificationTokenException::new
                );

        if (!token.isUsable(now)) {
            throw new InvalidEmailVerificationTokenException();
        }

        User user = userRepository
            .findById(token.getUserId())
            .orElseThrow(
                InvalidEmailVerificationTokenException::new
            );

        if (!user.isPendingVerification()) {
            throw new InvalidEmailVerificationTokenException();
        }

        token.consume(now);
        user.verifyEmail(now);

        eventPublisher.publishEvent(
            new UserActivatedEvent(user.getId())
        );
    }

    @Transactional
    public void resend(String email) {

        String normalizedEmail =
            email.trim().toLowerCase(Locale.ROOT);

        userRepository
            .findByEmail(normalizedEmail)
            .filter(User::isPendingVerification)
            .ifPresent(this::issueToken);
    }

    private void issueToken(User user) {

        Instant now = Instant.now();

        tokenRepository
            .findActiveByUserIdForUpdate(user.getId())
            .ifPresent(token -> {
                token.invalidate(now);
                tokenRepository.flush();
            });

        String rawToken = tokenCodec.generate();
        String tokenHash = tokenCodec.hash(rawToken);

        Instant expiresAt = now.plus(properties.tokenTtl());

        EmailVerificationToken replacement =
            EmailVerificationToken.issue(
                user.getId(),
                tokenHash,
                now,
                expiresAt
            );

        tokenRepository.saveAndFlush(replacement);

        eventPublisher.publishEvent(
            new EmailVerificationRequested(
                user.getEmail(),
                rawToken,
                expiresAt
            )
        );
    }
}
