package za.co.pixelly.fintrack.config.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

@ConfigurationProperties(
    prefix = "fintrack.security.password-reset"
)
public record PasswordResetProperties(
    Duration tokenTtl
) {
}
