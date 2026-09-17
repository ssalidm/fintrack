package za.co.pixelly.fintrack.config.security;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.method.HandlerTypePredicate;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import za.co.pixelly.fintrack.common.security.CurrentJwtClaimArgumentResolver;

import java.util.List;

@Configuration
@EnableConfigurationProperties(ApiProperties.class)
public class ApiWebConfiguration
    implements WebMvcConfigurer {

    private final ApiProperties apiProperties;
    private final CurrentJwtClaimArgumentResolver
        currentJwtClaimArgumentResolver;

    public ApiWebConfiguration(
        ApiProperties apiProperties,
        CurrentJwtClaimArgumentResolver
            currentJwtClaimArgumentResolver
    ) {
        this.apiProperties =
            apiProperties;

        this.currentJwtClaimArgumentResolver =
            currentJwtClaimArgumentResolver;
    }

    @Override
    public void configurePathMatch(
        PathMatchConfigurer configurer
    ) {
        configurer.addPathPrefix(
            apiProperties.basePath(),
            HandlerTypePredicate
                .forAnnotation(
                    RestController.class
                )
                .and(
                    HandlerTypePredicate
                        .forBasePackage(
                            "za.co.pixelly.fintrack"
                        )
                )
        );
    }

    @Override
    public void addArgumentResolvers(
        List<HandlerMethodArgumentResolver>
            resolvers
    ) {
        resolvers.add(
            currentJwtClaimArgumentResolver
        );
    }
}
