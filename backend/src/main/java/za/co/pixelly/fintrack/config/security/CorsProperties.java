package za.co.pixelly.fintrack.config.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@ConfigurationProperties(prefix = "fintrack.security.cors")
public record CorsProperties(
    List<String> allowedOrigins
) {

    public CorsProperties {
        allowedOrigins = allowedOrigins == null
            ? List.of()
            : allowedOrigins.stream()
            .map(String::trim)
            .filter(origin -> !origin.isBlank())
            .toList();

        if (allowedOrigins.contains("*")) {
            throw new IllegalArgumentException(
                "Wildcard CORS origins are not allowed"
            );
        }
    }
}
