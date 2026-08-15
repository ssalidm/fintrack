package za.co.pixelly.fintrack.integration.support;

import java.util.UUID;

public record AuthenticatedUser(
    UUID userId,
    String email,
    String accessToken,
    String refreshToken
) {
}
