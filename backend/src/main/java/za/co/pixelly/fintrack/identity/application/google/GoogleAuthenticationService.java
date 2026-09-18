package za.co.pixelly.fintrack.identity.application.google;

import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import za.co.pixelly.fintrack.common.Util;
import za.co.pixelly.fintrack.identity.api.LoginResponse;
import za.co.pixelly.fintrack.identity.application.EmailVerificationService;
import za.co.pixelly.fintrack.identity.application.LoginCompletionService;
import za.co.pixelly.fintrack.identity.application.event.UserActivatedEvent;
import za.co.pixelly.fintrack.identity.application.exceptions.InvalidCredentialsException;
import za.co.pixelly.fintrack.identity.domain.ApplicationRole;
import za.co.pixelly.fintrack.identity.domain.ExternalIdentity;
import za.co.pixelly.fintrack.identity.domain.ExternalIdentityProvider;
import za.co.pixelly.fintrack.identity.domain.User;
import za.co.pixelly.fintrack.identity.domain.UserRole;
import za.co.pixelly.fintrack.identity.persistence.ApplicationRoleRepository;
import za.co.pixelly.fintrack.identity.persistence.ExternalIdentityRepository;
import za.co.pixelly.fintrack.identity.persistence.UserRepository;
import za.co.pixelly.fintrack.identity.persistence.UserRoleRepository;

import java.time.Clock;
import java.time.Instant;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class GoogleAuthenticationService {

    private static final String DEFAULT_ROLE = "ROLE_USER";

    private final GoogleIdTokenVerifier googleIdTokenVerifier;
    private final ExternalIdentityRepository externalIdentityRepository;
    private final UserRepository userRepository;
    private final ApplicationRoleRepository applicationRoleRepository;
    private final UserRoleRepository userRoleRepository;
    private final EmailVerificationService emailVerificationService;
    private final LoginCompletionService loginCompletionService;
    private final ApplicationEventPublisher eventPublisher;
    private final Clock applicationClock;


    @Transactional
    public LoginResponse login(
        String credential,
        String userAgent
    ) {
        GoogleIdentity googleIdentity =
            googleIdTokenVerifier.verify(
                credential
            );

        Instant now = applicationClock.instant();

        return externalIdentityRepository
            .findByProviderAndProviderSubject(
                ExternalIdentityProvider.GOOGLE,
                googleIdentity.subject()
            )
            .map(
                identity ->
                    authenticateLinkedUser(
                        identity.getUser(),
                        userAgent,
                        now
                    )
            )
            .orElseGet(
                () ->
                    handleNewIdentity(
                        googleIdentity,
                        userAgent,
                        now
                    )
            );
    }


    private LoginResponse handleNewIdentity(
        GoogleIdentity identity,
        String userAgent,
        Instant now
    ) {
        String email =
            Util.normalizeEmail(
                identity.email()
            );

        /*
         * Never automatically connect a new Google
         * identity to an existing local account using
         * email alone.
         */
        if (
            userRepository.existsByEmail(email)
        ) {
            return LoginResponse.accountLinkRequired();
        }

        boolean authoritativeEmail =
            isGoogleAuthoritativeForEmail(
                identity,
                email
            );

        User user =
            User.registerExternal(
                email,
                firstName(identity, email),
                lastName(identity),
                authoritativeEmail,
                now
            );

        userRepository.saveAndFlush(user);

        ApplicationRole role =
            applicationRoleRepository
                .findByCode(
                    DEFAULT_ROLE
                )
                .orElseThrow(
                    () ->
                        new IllegalStateException(
                            "Required role ROLE_USER is not configured"
                        )
                );

        userRoleRepository.save(
            UserRole.assign(
                user,
                role
            )
        );

        ExternalIdentity externalIdentity =
            ExternalIdentity.link(
                user,
                ExternalIdentityProvider.GOOGLE,
                identity.subject(),
                now
            );

        externalIdentityRepository
            .saveAndFlush(externalIdentity);

        /*
         * Google is authoritative for Gmail addresses
         * and verified Google Workspace identities.
         *
         * Those accounts can become active immediately.
         */
        if (authoritativeEmail) {
            eventPublisher.publishEvent(
                new UserActivatedEvent(
                    user.getId()
                )
            );

            return loginCompletionService
                .complete(
                    user,
                    userAgent,
                    now
                );
        }

        /*
         * For third-party email addresses Google may
         * not be authoritative for current ownership.
         * Reuse FinTrack's normal verification flow.
         */
        emailVerificationService.issueFor(
            user
        );

        return LoginResponse
            .emailVerificationRequired();
    }


    private LoginResponse authenticateLinkedUser(
        User user,
        String userAgent,
        Instant now
    ) {
        if (
            user.isPendingVerification()
        ) {
            return LoginResponse
                .emailVerificationRequired();
        }

        if (
            !user.canAuthenticate(
                now
            )
        ) {
            throw new InvalidCredentialsException();
        }

        return loginCompletionService
            .complete(
                user,
                userAgent,
                now
            );
    }


    private boolean
    isGoogleAuthoritativeForEmail(
        GoogleIdentity identity,
        String email
    ) {
        if (
            email
                .toLowerCase(
                    Locale.ROOT
                )
                .endsWith(
                    "@gmail.com"
                )
        ) {
            return true;
        }

        return identity.emailVerified()
            && identity.hostedDomain() != null
            && !identity
            .hostedDomain()
            .isBlank();
    }


    private String firstName(
        GoogleIdentity identity,
        String email
    ) {
        if (
            hasText(identity.givenName())
        ) {
            return truncate(
                identity.givenName(),
                100
            );
        }

        if (hasText(identity.name())) {
            String fullName = identity.name().trim();

            int space = fullName.indexOf(' ');

            return truncate(
                space > 0
                    ? fullName.substring(
                    0,
                    space
                )
                    : fullName,
                100
            );
        }

        return truncate(email.substring(0, email.indexOf('@')), 100);
    }


    private String lastName(
        GoogleIdentity identity
    ) {
        if (hasText(identity.familyName())) {
            return truncate(identity.familyName(), 100);
        }

        if (hasText(identity.name())) {
            String fullName = identity.name().trim();

            int space = fullName.indexOf(' ');

            if (space > 0 && space < fullName.length() - 1) {
                return truncate(fullName.substring(space + 1), 100);
            }
        }

        /*
         * Existing user schema requires a non-blank
         * family name. Users can edit this afterwards.
         */
        return "User";
    }


    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }


    private String truncate(String value, int maxLength) {
        String normalized = value.trim();

        return normalized.length()
            <= maxLength
            ? normalized
            : normalized.substring(
            0,
            maxLength
        );
    }
}
