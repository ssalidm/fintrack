package za.co.pixelly.fintrack.identity.application.google;

import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtAudienceValidator;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;
import za.co.pixelly.fintrack.config.security.GoogleIdentityProperties;

import java.util.Set;

@Component
public class NimbusGoogleIdTokenVerifier
    implements GoogleIdTokenVerifier {

    private static final String
        GOOGLE_JWK_SET_URI = "https://www.googleapis.com/oauth2/v3/certs";

    private static final Set<String>
        VALID_ISSUERS =
        Set.of(
            "accounts.google.com",
            "https://accounts.google.com"
        );

    private final GoogleIdentityProperties
        properties;

    private final JwtDecoder decoder;


    public NimbusGoogleIdTokenVerifier(
        GoogleIdentityProperties properties
    ) {
        this.properties = properties;

        NimbusJwtDecoder nimbusDecoder =
            NimbusJwtDecoder
                .withJwkSetUri(
                    GOOGLE_JWK_SET_URI
                )
                .build();

        OAuth2TokenValidator<Jwt>
            defaultValidator =
            JwtValidators.createDefault();

        OAuth2TokenValidator<Jwt>
            audienceValidator =
            new JwtAudienceValidator(
                properties.clientId() == null
                    ? ""
                    : properties.clientId()
            );

        OAuth2TokenValidator<Jwt>
            issuerValidator =
            this::validateIssuer;

        nimbusDecoder.setJwtValidator(
            new DelegatingOAuth2TokenValidator<>(
                defaultValidator,
                audienceValidator,
                issuerValidator
            )
        );

        this.decoder =
            nimbusDecoder;
    }


    @Override
    public GoogleIdentity verify(
        String credential
    ) {
        requireConfigured();

        Jwt jwt;

        try {
            jwt =
                decoder.decode(
                    credential
                );

        } catch (
            JwtException exception
        ) {
            throw new InvalidGoogleCredentialException();
        }

        String subject =
            jwt.getSubject();

        String email =
            jwt.getClaimAsString(
                "email"
            );

        if (
            subject == null
                || subject.isBlank()
                || email == null
                || email.isBlank()
        ) {
            throw new InvalidGoogleCredentialException();
        }

        return new GoogleIdentity(
            subject,
            email,
            Boolean.TRUE.equals(
                jwt.getClaimAsBoolean(
                    "email_verified"
                )
            ),
            jwt.getClaimAsString(
                "given_name"
            ),
            jwt.getClaimAsString(
                "family_name"
            ),
            jwt.getClaimAsString(
                "name"
            ),
            jwt.getClaimAsString(
                "hd"
            )
        );
    }


    private OAuth2TokenValidatorResult
    validateIssuer(
        Jwt jwt
    ) {
        String issuer =
            jwt.getClaimAsString(
                "iss"
            );

        if (
            issuer != null
                && VALID_ISSUERS.contains(
                issuer
            )
        ) {
            return OAuth2TokenValidatorResult
                .success();
        }

        OAuth2Error error =
            new OAuth2Error(
                "invalid_token",
                "Invalid Google token issuer",
                null
            );

        return OAuth2TokenValidatorResult
            .failure(
                error
            );
    }


    private void requireConfigured() {
        if (
            properties.clientId() == null
                || properties
                .clientId()
                .isBlank()
        ) {
            throw new GoogleAuthenticationUnavailableException();
        }
    }
}
