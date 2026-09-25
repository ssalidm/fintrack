package za.co.pixelly.fintrack.identity.application.google;

import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import za.co.pixelly.fintrack.common.Util;
import za.co.pixelly.fintrack.identity.application.exceptions.InvalidCredentialsException;
import za.co.pixelly.fintrack.identity.application.exceptions.UserProfileNotFoundException;
import za.co.pixelly.fintrack.identity.domain.AuthSession;
import za.co.pixelly.fintrack.identity.domain.ExternalIdentity;
import za.co.pixelly.fintrack.identity.domain.ExternalIdentityProvider;
import za.co.pixelly.fintrack.identity.domain.User;
import za.co.pixelly.fintrack.identity.persistence.AuthSessionRepository;
import za.co.pixelly.fintrack.identity.persistence.ExternalIdentityRepository;
import za.co.pixelly.fintrack.identity.persistence.UserRepository;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GoogleIdentityLinkService {

    private static final Duration MAX_SESSION_AGE = Duration.ofMinutes(5);

    private final GoogleIdTokenVerifier googleIdTokenVerifier;
    private final ExternalIdentityRepository externalIdentityRepository;
    private final UserRepository userRepository;
    private final AuthSessionRepository authSessionRepository;
    private final Clock applicationClock;


    @Transactional
    public void link(
        UUID userId,
        UUID sessionId,
        String credential
    ) {
        Instant now = applicationClock.instant();

        requireFreshSession(
            userId,
            sessionId,
            now
        );

        GoogleIdentity googleIdentity =
            googleIdTokenVerifier.verify(
                credential
            );

        User user =
            userRepository
                .findByIdForUpdate(
                    userId
                )
                .orElseThrow(
                    UserProfileNotFoundException::new
                );

        if (!user.isActive()) {
            throw new InvalidCredentialsException();
        }

        String googleEmail =
            Util.normalizeEmail(
                googleIdentity.email()
            );

        /*
         * The ACCOUNT_LINK_REQUIRED flow is only
         * allowed to connect the Google identity
         * whose email matched the existing account.
         */
        if (
            !user.getEmail().equals(
                googleEmail
            )
        ) {
            throw new GoogleIdentityLinkConflictException();
        }

        /*
         * A Google identity can belong to only one
         * FinTrack account.
         */
        ExternalIdentity existingIdentity =
            externalIdentityRepository
                .findByProviderAndProviderSubject(
                    ExternalIdentityProvider.GOOGLE,
                    googleIdentity.subject()
                )
                .orElse(null);

        if (existingIdentity != null) {

            if (
                existingIdentity
                    .getUser()
                    .getId()
                    .equals(userId)
            ) {
                /*
                 * Idempotent success.
                 */
                return;
            }

            throw new GoogleIdentityLinkConflictException();
        }

        /*
         * One FinTrack account can have only one
         * Google identity.
         */
        ExternalIdentity existingGoogleLink =
            externalIdentityRepository
                .findByUser_IdAndProvider(
                    userId,
                    ExternalIdentityProvider.GOOGLE
                )
                .orElse(null);

        if (existingGoogleLink != null) {

            if (
                existingGoogleLink
                    .getProviderSubject()
                    .equals(
                        googleIdentity.subject()
                    )
            ) {
                return;
            }

            throw new GoogleIdentityLinkConflictException();
        }

        ExternalIdentity link =
            ExternalIdentity.link(
                user,
                ExternalIdentityProvider.GOOGLE,
                googleIdentity.subject(),
                now
            );

        try {
            externalIdentityRepository
                .saveAndFlush(
                    link
                );

        } catch (
            DataIntegrityViolationException exception
        ) {
            /*
             * Protect against concurrent linking
             * attempts racing past the application
             * checks above.
             */
            throw new GoogleIdentityLinkConflictException();
        }
    }


    private void requireFreshSession(
        UUID userId,
        UUID sessionId,
        Instant now
    ) {
        AuthSession session =
            authSessionRepository
                .findByIdAndUserId(
                    sessionId,
                    userId
                )
                .orElseThrow(
                    GoogleLinkReauthenticationRequiredException::new
                );

        if (!session.isActive(now)) {
            throw new GoogleLinkReauthenticationRequiredException();
        }

        Instant createdAt =
            session.getCreatedAt();

        if (
            createdAt == null
                || createdAt.isBefore(
                now.minus(
                    MAX_SESSION_AGE
                )
            )
        ) {
            throw new GoogleLinkReauthenticationRequiredException();
        }
    }
}
