package za.co.pixelly.fintrack.config.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

@ConfigurationProperties(prefix = "fintrack.security.email-verification")
public record EmailVerificationProperties(
    Duration tokenTtl
) {
}
