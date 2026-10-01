package za.co.pixelly.fintrack.identity.application;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import za.co.pixelly.fintrack.identity.api.LoginResponse;
import za.co.pixelly.fintrack.identity.api.MfaChallengeResponse;
import za.co.pixelly.fintrack.identity.application.mfa.IssuedMfaChallenge;
import za.co.pixelly.fintrack.identity.application.mfa.MfaChallengeService;
import za.co.pixelly.fintrack.identity.domain.MfaStatus;
import za.co.pixelly.fintrack.identity.domain.User;
import za.co.pixelly.fintrack.identity.persistence.UserMfaRepository;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class LoginCompletionService {

    private final UserMfaRepository
        userMfaRepository;

    private final MfaChallengeService
        mfaChallengeService;

    private final AuthenticatedSessionService
        authenticatedSessionService;


    @Transactional(
        propagation = Propagation.MANDATORY
    )
    public LoginResponse complete(
        User user,
        String userAgent,
        Instant now
    ) {
        boolean mfaEnabled =
            userMfaRepository
                .existsByUserIdAndStatus(
                    user.getId(),
                    MfaStatus.ENABLED
                );

        if (mfaEnabled) {
            IssuedMfaChallenge challenge =
                mfaChallengeService.issue(
                    user.getId(),
                    userAgent
                );

            return LoginResponse
                .mfaRequired(
                    new MfaChallengeResponse(
                        challenge.rawToken(),
                        challenge.expiresAt()
                    )
                );
        }

        return LoginResponse
            .authenticated(
                authenticatedSessionService
                    .issue(
                        user,
                        userAgent,
                        now
                    )
            );
    }
}
