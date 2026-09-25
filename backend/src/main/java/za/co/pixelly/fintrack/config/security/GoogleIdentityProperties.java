package za.co.pixelly.fintrack.config.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "fintrack.security.google")
public record GoogleIdentityProperties(
    String clientId
) {
}
