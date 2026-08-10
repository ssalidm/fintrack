package za.co.pixelly.fintrack.identity.application;

import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;
import za.co.pixelly.fintrack.config.security.JwtProperties;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AccessTokenService {

    private final JwtEncoder jwtEncoder;
    private final JwtProperties properties;

    public IssuedAccessToken issue(
        UUID userId,
        UUID sessionId,
        List<String> roles,
        Instant now
    ) {
        Instant expiresAt =
            now.plus(properties.accessTokenTtl());

        JwtClaimsSet claims = JwtClaimsSet.builder()
            .issuer(properties.issuer())
            .subject(userId.toString())
            .issuedAt(now)
            .expiresAt(expiresAt)
            .id(UUID.randomUUID().toString())
            .claim("sid", sessionId.toString())
            .claim("roles", roles)
            .build();

        String token = jwtEncoder
            .encode(JwtEncoderParameters.from(claims))
            .getTokenValue();

        return new IssuedAccessToken(token, expiresAt);
    }

    public record IssuedAccessToken(
        String value,
        Instant expiresAt
    ) {
    }
}
