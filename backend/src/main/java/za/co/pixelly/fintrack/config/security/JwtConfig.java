package za.co.pixelly.fintrack.config.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtIssuerValidator;
import org.springframework.security.oauth2.jwt.JwtTimestampValidator;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.time.Clock;
import java.util.Base64;

@Configuration(proxyBeanMethods = false)
public class JwtConfig {

    @Bean
    SecretKey jwtSecretKey(
        JwtProperties properties
    ) {
        byte[] decoded =
            Base64.getDecoder()
                .decode(
                    properties.secret()
                );

        if (decoded.length < 32) {
            throw new IllegalStateException(
                "FINTRACK_JWT_SECRET must decode to at least 32 bytes"
            );
        }

        return new SecretKeySpec(
            decoded,
            "HmacSHA256"
        );
    }


    @Bean
    JwtEncoder jwtEncoder(
        SecretKey secretKey
    ) {
        return NimbusJwtEncoder
            .withSecretKey(
                secretKey
            )
            .algorithm(
                MacAlgorithm.HS256
            )
            .build();
    }


    @Bean
    JwtDecoder jwtDecoder(
        SecretKey secretKey,
        JwtSessionValidator jwtSessionValidator,
        JwtProperties properties,
        Clock applicationClock
    ) {
        NimbusJwtDecoder decoder =
            NimbusJwtDecoder
                .withSecretKey(
                    secretKey
                )
                .macAlgorithm(
                    MacAlgorithm.HS256
                )
                .build();

        JwtTimestampValidator timestampValidator =
            new JwtTimestampValidator();

        timestampValidator.setClock(
            applicationClock
        );

        OAuth2TokenValidator<Jwt>
            issuerValidator =
            new JwtIssuerValidator(
                properties.issuer()
            );

        OAuth2TokenValidator<Jwt>
            validator =
            new DelegatingOAuth2TokenValidator<>(
                timestampValidator,
                issuerValidator,
                jwtSessionValidator
            );

        decoder.setJwtValidator(
            validator
        );

        return decoder;
    }


    @Bean
    JwtAuthenticationConverter
    jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter
            authorities =
            new JwtGrantedAuthoritiesConverter();

        authorities.setAuthoritiesClaimName(
            "roles"
        );

        authorities.setAuthorityPrefix(
            ""
        );

        JwtAuthenticationConverter converter =
            new JwtAuthenticationConverter();

        converter
            .setJwtGrantedAuthoritiesConverter(
                authorities
            );

        return converter;
    }
}
