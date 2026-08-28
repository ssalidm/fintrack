package za.co.pixelly.fintrack.config.security;


import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2ErrorCodes;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import za.co.pixelly.fintrack.identity.domain.AuthSession;
import za.co.pixelly.fintrack.identity.persistence.AuthSessionRepository;

import java.time.Instant;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JwtSessionValidator implements OAuth2TokenValidator<Jwt> {

    private static final OAuth2Error INVALID_SESSION = new OAuth2Error(
        OAuth2ErrorCodes.INVALID_TOKEN,
        "The access token is invalid or no longer active",
        null
    );

    private final AuthSessionRepository authSessionRepository;


    @Override
    public OAuth2TokenValidatorResult validate(Jwt token) {
        UUID userId = parseUuid(token.getSubject());
        UUID sessionId = parseUuid(token.getClaimAsString("sid"));

        if (userId == null || sessionId == null) {
            return OAuth2TokenValidatorResult.failure(INVALID_SESSION);
        }

        AuthSession session = authSessionRepository
            .findByIdAndUserId(sessionId, userId).orElse(null);

        if (session == null || !session.isActive(Instant.now())) {
            return OAuth2TokenValidatorResult.failure(INVALID_SESSION);
        }

        return OAuth2TokenValidatorResult.success();
    }

    private UUID parseUuid(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        try {
            return UUID.fromString(value);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
