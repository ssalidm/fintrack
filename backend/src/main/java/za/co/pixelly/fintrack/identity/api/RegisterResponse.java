package za.co.pixelly.fintrack.identity.api;

import za.co.pixelly.fintrack.identity.domain.User;
import za.co.pixelly.fintrack.identity.domain.UserStatus;

import java.time.Instant;
import java.util.UUID;

public record RegisterResponse(
    UUID id,
    String email,
    String firstName,
    String lastName,
    UserStatus status,
    Instant createdAt
) {

    public static RegisterResponse from(User user) {
        return new RegisterResponse(
            user.getId(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getStatus(),
            user.getCreatedAt()
        );
    }
}
