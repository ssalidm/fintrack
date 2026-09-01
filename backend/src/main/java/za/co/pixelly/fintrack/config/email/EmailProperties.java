package za.co.pixelly.fintrack.config.email;


import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "fintrack.email")
public record EmailProperties(
    boolean enabled,
    String from,
    String fromName,
    String frontendBaseUrl
) {
}
