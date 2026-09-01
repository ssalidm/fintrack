package za.co.pixelly.fintrack.identity.api.admin;

import za.co.pixelly.fintrack.identity.domain.User;
import za.co.pixelly.fintrack.identity.domain.UserStatus;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record AdminUserResponse(

    UUID id,
    String email,
    String firstName,
    String lastName,
    UserStatus status,
    boolean emailVerified,
    List<String> roles,
    Instant lastLoginAt,
    Instant createdAt,
    Instant updatedAt,
    long version

) {

    public static AdminUserResponse from(
        User user,
        List<String> roles
    ) {
        return new AdminUserResponse(
            user.getId(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getStatus(),
            user.getEmailVerifiedAt() != null,
            List.copyOf(roles),
            user.getLastLoginAt(),
            user.getCreatedAt(),
            user.getUpdatedAt(),
            user.getVersion()
        );
    }
}
