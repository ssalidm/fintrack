package za.co.pixelly.fintrack.config.support;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.net.http.HttpClient;
import java.time.Duration;

@Configuration(proxyBeanMethods = false)
@EnableConfigurationProperties(
    SupportProperties.class
)
public class SupportConfiguration {

    @Bean
    @Qualifier("turnstileRestClient")
    RestClient turnstileRestClient() {
        HttpClient httpClient =
            HttpClient.newBuilder()
                .connectTimeout(
                    Duration.ofSeconds(3)
                )
                .followRedirects(
                    HttpClient.Redirect.NEVER
                )
                .build();

        JdkClientHttpRequestFactory requestFactory =
            new JdkClientHttpRequestFactory(
                httpClient
            );

        requestFactory.setReadTimeout(
            Duration.ofSeconds(5)
        );

        return RestClient.builder()
            .baseUrl("https://challenges.cloudflare.com")
            .requestFactory(requestFactory)
            .build();
    }
}
