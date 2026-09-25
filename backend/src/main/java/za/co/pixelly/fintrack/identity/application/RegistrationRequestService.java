package za.co.pixelly.fintrack.identity.application;

import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import za.co.pixelly.fintrack.common.Util;
import za.co.pixelly.fintrack.config.security.EmailVerificationProperties;
import za.co.pixelly.fintrack.identity.domain.RegistrationRequest;
import za.co.pixelly.fintrack.identity.persistence.RegistrationRequestRepository;
import za.co.pixelly.fintrack.identity.persistence.UserRepository;

import java.time.Clock;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class RegistrationRequestService {

    private final RegistrationRequestRepository registrationRequestRepository;
    private final UserRepository userRepository;
    private final OpaqueTokenCodec tokenCodec;
    private final EmailVerificationProperties emailVerificationProperties;
    private final ApplicationEventPublisher eventPublisher;
    private final Clock applicationClock;


    @Transactional
    public void start(
        String rawEmail
    ) {
        String email =
            Util.normalizeEmail(
                rawEmail
            );

        /*
         * Deliberately return normally when
         * the email already belongs to a user.
         *
         * The controller always returns the
         * same response so registration cannot
         * be used for account enumeration.
         */
        if (userRepository.existsByEmail(email)
        ) {
            return;
        }

        Instant now = applicationClock.instant();

        registrationRequestRepository
            .findActiveByEmailForUpdate(email)
            .ifPresent(
                existing -> {
                    existing.invalidate(
                        now
                    );

                    registrationRequestRepository.flush();
                }
            );

        String rawToken = tokenCodec.generate();

        String tokenHash =
            tokenCodec.hash(
                rawToken
            );

        RegistrationRequest request =
            RegistrationRequest.issue(
                email,
                tokenHash,
                now,
                now.plus(
                    emailVerificationProperties
                        .tokenTtl()
                )
            );

        registrationRequestRepository
            .saveAndFlush(
                request
            );

        eventPublisher.publishEvent(
            new RegistrationEmailRequested(
                email,
                rawToken
            )
        );
    }
}
