package za.co.pixelly.fintrack.config.storage;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import za.co.pixelly.fintrack.identity.application.avatar.ProfileImageStorage;
import za.co.pixelly.fintrack.identity.infrastructure.avatar.R2ProfileImageStorage;

@Configuration(proxyBeanMethods = false)
@ConditionalOnProperty(
    prefix = "fintrack.profile.avatar",
    name = "storage",
    havingValue = "r2"
)
@EnableConfigurationProperties(
    R2Properties.class
)
public class R2StorageConfiguration {

    @Bean(destroyMethod = "close")
    public S3Client r2S3Client(
        R2Properties properties
    ) {
        AwsBasicCredentials credentials =
            AwsBasicCredentials.create(
                properties.accessKeyId(),
                properties.secretAccessKey()
            );

        S3Configuration s3Configuration =
            S3Configuration
                .builder()
                .pathStyleAccessEnabled(true)
                .chunkedEncodingEnabled(false)
                .build();

        return S3Client
            .builder()
            .endpointOverride(
                properties.endpoint()
            )
            .region(
                Region.of("auto")
            )
            .credentialsProvider(
                StaticCredentialsProvider.create(
                    credentials
                )
            )
            .serviceConfiguration(
                s3Configuration
            )
            .build();
    }

    @Bean
    public ProfileImageStorage r2ProfileImageStorage(
        S3Client r2S3Client,
        R2Properties properties
    ) {
        return new R2ProfileImageStorage(
            r2S3Client,
            properties.bucket()
        );
    }
}
