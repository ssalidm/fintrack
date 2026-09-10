package za.co.pixelly.fintrack.identity.application.emailchange;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import za.co.pixelly.fintrack.identity.application.EmailChangeSender;
import za.co.pixelly.fintrack.identity.application.OpaqueTokenCodec;
import za.co.pixelly.fintrack.identity.application.exceptions.*;
import za.co.pixelly.fintrack.identity.application.mfa.MfaReauthenticationService;
import za.co.pixelly.fintrack.identity.domain.EmailChangeRequest;
import za.co.pixelly.fintrack.identity.domain.User;
import za.co.pixelly.fintrack.identity.persistence.AuthSessionRepository;
import za.co.pixelly.fintrack.identity.persistence.EmailChangeRequestRepository;
import za.co.pixelly.fintrack.identity.persistence.RefreshTokenRepository;
import za.co.pixelly.fintrack.identity.persistence.UserRepository;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmailChangeService {

    private static final Duration TOKEN_TTL =
        Duration.ofHours(1);

    private final UserRepository userRepository;
    private final EmailChangeRequestRepository emailChangeRequestRepository;

    private final PasswordEncoder passwordEncoder;
    private final OpaqueTokenCodec tokenCodec;
    private final MfaReauthenticationService mfaReauthenticationService;
    private final EmailChangeSender emailChangeSender;
    private final AuthSessionRepository sessionRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final Clock clock;

    @Transactional
    public void initiate(
        UUID userId,
        String requestedEmail,
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
         * First reauthenticate using the user's
         * current password.
         */
        if (!passwordEncoder.matches(
            currentPassword,
            user.getPasswordHash()
        )) {
            throw new InvalidCurrentPasswordException();
        }

        String newEmail =
            normalizeEmail(
                requestedEmail
            );

        if (user.getEmail().equals(newEmail)) {
            throw new EmailUnchangedException();
        }

        if (userRepository.existsByEmail(
            newEmail
        )) {
            throw new DuplicateEmailException();
        }

        /*
         * If the account has MFA enabled, require a
         * second factor before allowing this sensitive
         * identity operation.
         */
        mfaReauthenticationService
            .verifyIfRequired(
                userId,
                mfaCode,
                now
            );

        /*
         * Only one pending email-change request should
         * remain active for a user.
         */
        emailChangeRequestRepository
            .findActiveByUserIdForUpdate(userId)
            .ifPresent(
                request -> {
                    request.invalidate(now);

                    /*
                     * Flush the invalidation before inserting
                     * the replacement request.
                     *
                     * PostgreSQL enforces one active request
                     * per user using a partial unique index.
                     */
                    emailChangeRequestRepository.flush();
                }
            );

        String rawToken =
            tokenCodec.generate();

        Instant expiresAt =
            now.plus(TOKEN_TTL);

        EmailChangeRequest request =
            EmailChangeRequest.issue(
                userId,
                user.getEmail(),
                newEmail,
                tokenCodec.hash(rawToken),
                now,
                expiresAt
            );

        emailChangeRequestRepository.saveAndFlush(
            request
        );

        emailChangeSender.sendVerificationEmail(
            newEmail,
            user.getFirstName(),
            rawToken,
            expiresAt
        );
    }


    @Transactional(noRollbackFor = {
        InvalidEmailVerificationTokenException.class,
        DuplicateEmailException.class
    })
    public void confirm(
        String rawToken
    ) {
        Instant now =
            clock.instant();

        String tokenHash =
            tokenCodec.hash(
                rawToken
            );

        EmailChangeRequest request =
            emailChangeRequestRepository
                .findByTokenHashForUpdate(
                    tokenHash
                )
                .orElseThrow(
                    InvalidEmailVerificationTokenException::new
                );

        if (!request.isUsable(now)) {
            request.invalidate(now);

            throw new InvalidEmailVerificationTokenException();
        }

        User user =
            userRepository
                .findByIdForUpdate(
                    request.getUserId()
                )
                .orElseThrow(
                    InvalidEmailVerificationTokenException::new
                );

        /*
         * The request was created against a specific
         * current email address.
         *
         * If the account's email has somehow changed
         * since then, this request must no longer be used.
         */
        if (!user.getEmail().equals(
            request.getCurrentEmail()
        )) {
            request.invalidate(now);

            throw new InvalidEmailVerificationTokenException();
        }

        /*
         * Email availability must be checked again here.
         *
         * Another account may have claimed the address
         * after this request was created.
         */
        if (userRepository.existsByEmail(
            request.getNewEmail()
        )) {
            request.invalidate(now);

            throw new DuplicateEmailException();
        }

        user.changeEmail(
            request.getNewEmail(),
            now
        );

        request.confirm(now);

        /*
         * Changing the primary login identifier is a
         * security-sensitive operation.
         *
         * Revoke every existing session and refresh token.
         */
        refreshTokenRepository
            .revokeActiveByUserId(
                user.getId(),
                now,
                "EMAIL_CHANGED"
            );

        sessionRepository
            .revokeActiveByUserId(
                user.getId(),
                now,
                "EMAIL_CHANGED"
            );
    }

    private String normalizeEmail(
        String email
    ) {
        return email
            .trim()
            .toLowerCase(Locale.ROOT);
    }
}
