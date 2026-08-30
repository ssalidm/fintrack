package za.co.pixelly.fintrack.identity.application;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import za.co.pixelly.fintrack.identity.persistence.UserRepository;

import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserTimeService {

    private final UserRepository userRepository;
    private final Clock applicationClock;

    @Transactional(readOnly = true)
    public LocalDate today(UUID userId) {
        String timeZone = userRepository
            .findTimeZoneById(userId)
            .orElseThrow(() -> new IllegalStateException("User timezone not found"));

        return LocalDate.now(
            applicationClock.withZone(
                ZoneId.of(timeZone)
            )
        );
    }
}
