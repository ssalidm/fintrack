package za.co.pixelly.fintrack.common.security;

import org.springframework.core.MethodParameter;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import java.util.List;
import java.util.UUID;

@Component
public class CurrentJwtClaimArgumentResolver
    implements HandlerMethodArgumentResolver {

    @Override
    public boolean supportsParameter(
        MethodParameter parameter
    ) {
        if (
            parameter.hasParameterAnnotation(
                CurrentUserId.class
            )
        ) {
            return UUID.class.equals(
                parameter.getParameterType()
            );
        }

        if (
            parameter.hasParameterAnnotation(
                CurrentSessionId.class
            )
        ) {
            return UUID.class.equals(
                parameter.getParameterType()
            );
        }

        if (
            parameter.hasParameterAnnotation(
                CurrentUserRoles.class
            )
        ) {
            return List.class.isAssignableFrom(
                parameter.getParameterType()
            );
        }

        return false;
    }

    @Override
    public Object resolveArgument(
        MethodParameter parameter,
        ModelAndViewContainer mavContainer,
        NativeWebRequest webRequest,
        WebDataBinderFactory binderFactory
    ) {
        Jwt jwt = currentJwt();

        if (
            parameter.hasParameterAnnotation(
                CurrentUserId.class
            )
        ) {
            return parseUuid(
                jwt.getSubject(),
                "sub"
            );
        }

        if (
            parameter.hasParameterAnnotation(
                CurrentSessionId.class
            )
        ) {
            return parseUuid(
                jwt.getClaimAsString("sid"),
                "sid"
            );
        }

        if (
            parameter.hasParameterAnnotation(
                CurrentUserRoles.class
            )
        ) {
            List<String> roles =
                jwt.getClaimAsStringList(
                    "roles"
                );

            return roles == null
                ? List.of()
                : List.copyOf(roles);
        }

        throw new IllegalStateException(
            "Unsupported authentication parameter"
        );
    }

    private Jwt currentJwt() {
        Authentication authentication =
            SecurityContextHolder
                .getContext()
                .getAuthentication();

        if (
            !(authentication
                instanceof JwtAuthenticationToken jwtAuthentication)
                || !authentication.isAuthenticated()
        ) {
            throw new AuthenticationCredentialsNotFoundException(
                "Authenticated JWT is required"
            );
        }

        return jwtAuthentication.getToken();
    }

    private UUID parseUuid(
        String value,
        String claimName
    ) {
        if (
            value == null
                || value.isBlank()
        ) {
            throw new AuthenticationCredentialsNotFoundException(
                "Required JWT claim is missing: "
                    + claimName
            );
        }

        try {
            return UUID.fromString(value);
        } catch (IllegalArgumentException exception) {
            throw new AuthenticationCredentialsNotFoundException(
                "Invalid UUID JWT claim: "
                    + claimName,
                exception
            );
        }
    }
}
