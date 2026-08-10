package za.co.pixelly.fintrack.config.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

@ConfigurationProperties(prefix = "fintrack.security.jwt")
public record JwtProperties(
    String issuer,
    Duration accessTokenTtl,
    Duration RefreshTokenTtl,
    String secret
) {
}
