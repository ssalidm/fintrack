package za.co.pixelly.fintrack.config.support;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

@ConfigurationProperties(prefix = "fintrack.support")
public record SupportProperties(
    String recipient,
    Duration duplicateWindow,
    Turnstile turnstile,
    RateLimit rateLimit
) {

    public record Turnstile(
        String secretKey,
        String expectedHostname,
        String expectedAction
    ) {
    }

    public record RateLimit(
        long ipBurstCapacity,
        Duration ipBurstWindow,
        long ipDailyCapacity,
        Duration ipDailyWindow,
        long emailCapacity,
        Duration emailWindow
    ) {
    }
}
