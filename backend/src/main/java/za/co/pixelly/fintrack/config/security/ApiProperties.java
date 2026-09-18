package za.co.pixelly.fintrack.config.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "fintrack.api")
public record ApiProperties(
    String basePath
) {

    public ApiProperties {
        if (basePath == null || basePath.isBlank()) {
            throw new IllegalArgumentException("fintrack.api.base-path must not be blank");
        }

        if (!basePath.startsWith("/")) {
            throw new IllegalArgumentException("fintrack.api.base-path must start with '/'");
        }

        if (basePath.length() > 1 && basePath.endsWith("/")) {
            basePath = basePath.substring(0, basePath.length() - 1);
        }
    }
}
