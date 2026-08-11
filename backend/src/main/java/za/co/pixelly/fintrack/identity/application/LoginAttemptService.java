package za.co.pixelly.fintrack.identity.application;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import za.co.pixelly.fintrack.config.security.LoginSecurityProperties;
import za.co.pixelly.fintrack.identity.domain.User;
import za.co.pixelly.fintrack.identity.persistence.UserRepository;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LoginAttemptService {

    private final UserRepository userRepository;
    private final LoginSecurityProperties properties;

    @Transactional(
        propagation = Propagation.REQUIRES_NEW
    )
    public void recordFailure(UUID userId) {

        User user = userRepository.findByIdForUpdate(userId)
            .orElseThrow();

        user.recordFailedLogin(
            Instant.now(),
            properties.maxFailedAttempts(),
            properties.lockDuration()
        );
    }
}
