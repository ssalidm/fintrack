package za.co.pixelly.fintrack.identity.application;

import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import za.co.pixelly.fintrack.identity.api.CompleteRegistrationRequest;
import za.co.pixelly.fintrack.identity.application.event.UserActivatedEvent;
import za.co.pixelly.fintrack.identity.application.exceptions.DuplicateEmailException;
import za.co.pixelly.fintrack.identity.application.exceptions.InvalidRegistrationTokenException;
import za.co.pixelly.fintrack.identity.domain.ApplicationRole;
import za.co.pixelly.fintrack.identity.domain.RegistrationRequest;
import za.co.pixelly.fintrack.identity.domain.User;
import za.co.pixelly.fintrack.identity.domain.UserRole;
import za.co.pixelly.fintrack.identity.persistence.ApplicationRoleRepository;
import za.co.pixelly.fintrack.identity.persistence.RegistrationRequestRepository;
import za.co.pixelly.fintrack.identity.persistence.UserRepository;
import za.co.pixelly.fintrack.identity.persistence.UserRoleRepository;

import java.time.Clock;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class RegistrationCompletionService {

    private static final String DEFAULT_ROLE = "ROLE_USER";

    private final RegistrationRequestRepository registrationRequestRepository;
    private final UserRepository userRepository;
    private final ApplicationRoleRepository applicationRoleRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;
    private final OpaqueTokenCodec tokenCodec;
    private final ApplicationEventPublisher eventPublisher;

    private final Clock applicationClock;


    @Transactional
    public void complete(
        CompleteRegistrationRequest request
    ) {
        Instant now = applicationClock.instant();

        String tokenHash =
            tokenCodec.hash(
                request.token()
            );

        RegistrationRequest registration =
            registrationRequestRepository
                .findByTokenHashForUpdate(
                    tokenHash
                )
                .orElseThrow(
                    InvalidRegistrationTokenException::new
                );

        if (!registration.isUsable(now)) {
            throw new InvalidRegistrationTokenException();
        }

        String email = registration.getEmail();

        if (
            userRepository.existsByEmail(email)
        ) {
            throw new DuplicateEmailException();
        }

        ApplicationRole userRole =
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

        User user =
            User.registerVerified(
                email,
                passwordEncoder.encode(
                    request.password()
                ),
                request.firstName(),
                request.lastName(),
                request.preferredName(),
                now
            );

        try {
            userRepository.saveAndFlush(user);
        } catch (
            DataIntegrityViolationException exception
        ) {
            throw new DuplicateEmailException();
        }

        userRoleRepository.save(
            UserRole.assign(
                user,
                userRole
            )
        );

        /*
         * Consume only after the account
         * has been successfully created.
         */
        registration.consume(now);

        /*
         * Existing BEFORE_COMMIT listener
         * provisions the user's default
         * categories within this transaction.
         */
        eventPublisher.publishEvent(
            new UserActivatedEvent(
                user.getId()
            )
        );
    }
}
