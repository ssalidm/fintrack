package za.co.pixelly.fintrack.config.storage;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.net.URI;

@ConfigurationProperties(
    prefix = "fintrack.storage.r2"
)
public record R2Properties(
    URI endpoint,
    String bucket,
    String accessKeyId,
    String secretAccessKey
) {

    public R2Properties {
        if (
            endpoint == null
                || !endpoint.isAbsolute()
                || !"https".equalsIgnoreCase(
                endpoint.getScheme()
            )
        ) {
            throw new IllegalArgumentException(
                "fintrack.storage.r2.endpoint must be a valid HTTPS URL"
            );
        }

        bucket =
            requireText(
                bucket,
                "fintrack.storage.r2.bucket"
            );

        accessKeyId =
            requireText(
                accessKeyId,
                "fintrack.storage.r2.access-key-id"
            );

        secretAccessKey =
            requireText(
                secretAccessKey,
                "fintrack.storage.r2.secret-access-key"
            );
    }

    private static String requireText(
        String value,
        String property
    ) {
        if (
            value == null
                || value.isBlank()
        ) {
            throw new IllegalArgumentException(
                property + " must not be blank"
            );
        }

        return value.trim();
    }
}
