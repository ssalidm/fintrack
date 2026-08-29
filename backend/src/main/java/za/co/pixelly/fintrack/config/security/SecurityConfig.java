package za.co.pixelly.fintrack.config.security;

import org.springframework.boot.security.autoconfigure.actuate.web.servlet.EndpointRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration(proxyBeanMethods = false)
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(
        HttpSecurity http,
        JwtAuthenticationConverter jwtAuthenticationConverter,
        RestAuthenticationEntryPoint authenticationEntryPoint,
        RestAccessDeniedHandler accessDeniedHandler
    ) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)

            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers(
                    EndpointRequest.to(
                        "health",
                        "info"
                    )
                ).permitAll()

                .requestMatchers(
                    HttpMethod.POST,
                    "/api/v1/auth/register",
                    "/api/v1/auth/login",
                    "/api/v1/auth/refresh",
                    "/api/v1/auth/verify-email",
                    "/api/v1/auth/resend-verification",
                    "/api/v1/auth/forgot-password",
                    "/api/v1/auth/reset-password"
                ).permitAll()

                // OpenAPI / Swagger
                .requestMatchers(
                    "/swagger-ui.html",
                    "/swagger-ui/**",
                    "/v3/api-docs/**"
                )
                .permitAll()

                .requestMatchers("/api/v1/admin/**")
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
}
