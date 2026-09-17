package za.co.pixelly.fintrack.config.security;

import org.springframework.boot.security.autoconfigure.actuate.web.servlet.EndpointRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration(proxyBeanMethods = false)
@EnableWebSecurity
public class SecurityConfig {

    private final ApiProperties apiProperties;

    public SecurityConfig(ApiProperties apiProperties) {
        this.apiProperties = apiProperties;
    }


    @Bean
    SecurityFilterChain securityFilterChain(
        HttpSecurity http,
        JwtAuthenticationConverter jwtAuthenticationConverter,
        RestAuthenticationEntryPoint authenticationEntryPoint,
        RestAccessDeniedHandler accessDeniedHandler,
        UrlBasedCorsConfigurationSource corsConfigurationSource
    ) throws Exception {

        String apiPrefix = apiProperties.basePath();

        http
            .cors(cors ->
                cors.configurationSource(corsConfigurationSource)
            )
            .csrf(AbstractHttpConfigurer::disable)

            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers(
                    EndpointRequest.to(
                        "health"
                    )
                ).permitAll()

                .requestMatchers(
                    HttpMethod.POST,
                    apiPrefix + "/auth/register",
                    apiPrefix + "/auth/login",
                    apiPrefix + "/auth/refresh",
                    apiPrefix + "/auth/verify-email",
                    apiPrefix + "/auth/resend-verification",
                    apiPrefix + "/auth/forgot-password",
                    apiPrefix + "/auth/reset-password",
                    apiPrefix + "/auth/mfa/verify",
                    apiPrefix + "/auth/mfa/recover",
                    apiPrefix + "/auth/change-email/confirm"
                ).permitAll()

                // OpenAPI / Swagger
                .requestMatchers(
                    "/swagger-ui.html",
                    "/swagger-ui/**",
                    "/v3/api-docs/**"
                )
                .permitAll()

                .requestMatchers(apiPrefix + "/admin/**")
                .hasAuthority("ROLE_ADMIN")

                .anyRequest()
                .authenticated()
            )

            .exceptionHandling(exceptions ->
                exceptions
                    .authenticationEntryPoint(
                        authenticationEntryPoint
                    )
                    .accessDeniedHandler(
                        accessDeniedHandler
                    )
            )

            .oauth2ResourceServer(oauth2 ->
                oauth2
                    .authenticationEntryPoint(
                        authenticationEntryPoint
                    )
                    .accessDeniedHandler(
                        accessDeniedHandler
                    )
                    .jwt(jwt ->
                        jwt.jwtAuthenticationConverter(
                            jwtAuthenticationConverter
                        )
                    )
            );

        return http.build();
    }

    @Bean
    UrlBasedCorsConfigurationSource corsConfigurationSource(
        CorsProperties corsProperties
    ) {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(
            corsProperties.allowedOrigins()
        );

        configuration.setAllowedMethods(List.of(
            HttpMethod.GET.name(),
            HttpMethod.POST.name(),
            HttpMethod.PUT.name(),
            HttpMethod.PATCH.name(),
            HttpMethod.DELETE.name(),
            HttpMethod.OPTIONS.name()
        ));

        configuration.setAllowedHeaders(List.of(
            HttpHeaders.AUTHORIZATION,
            HttpHeaders.CONTENT_TYPE,
            HttpHeaders.ACCEPT
        ));

        configuration.setAllowCredentials(false);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
            new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
            apiProperties.basePath() + "/**",
            configuration
        );

        return source;
    }
}
