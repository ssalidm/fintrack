package za.co.pixelly.fintrack.identity.api;

import za.co.pixelly.fintrack.identity.domain.User;
import za.co.pixelly.fintrack.identity.domain.UserStatus;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record UserProfileResponse(

    UUID id,
    String email,
    String firstName,
    String lastName,
    UserStatus status,
    boolean emailVerified,
    Instant emailVerifiedAt,
    List<String> roles,
    Instant lastLoginAt,
    Instant createAt,
    Instant updatedAt,
    Long version
) {

    public static UserProfileResponse from(
        User user,
        List<String> roles
    ) {
        return new UserProfileResponse(
            user.getId(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getStatus(),
            user.getEmailVerifiedAt() != null,
            user.getEmailVerifiedAt(),
            List.copyOf(roles),
            user.getLastLoginAt(),
            user.getCreatedAt(),
            user.getUpdatedAt(),
            user.getVersion()
        );
    }
}
