package za.co.pixelly.fintrack.config.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

@ConfigurationProperties(prefix = "fintrack.security.mfa")
public record MfaProperties(
    String encryptionKey,
    String issuer,
    Duration challengeTtl,
    Duration challengeRetentionDuration,
    int maxAttempts,
    Duration lockoutDuration
) {
}
