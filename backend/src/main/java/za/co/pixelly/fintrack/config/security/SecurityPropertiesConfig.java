package za.co.pixelly.fintrack.config.security;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
@EnableConfigurationProperties({
    JwtProperties.class,
    EmailVerificationProperties.class
})
public class SecurityPropertiesConfig {
}
