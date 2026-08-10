package za.co.pixelly.fintrack.identity.api;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import za.co.pixelly.fintrack.common.api.ApiResponse;
import za.co.pixelly.fintrack.identity.application.AuthenticationService;
import za.co.pixelly.fintrack.identity.application.UserRegistrationService;

import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRegistrationService registrationService;
    private final AuthenticationService authenticationService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<RegisterResponse>> register(
        @Valid @RequestBody RegisterRequest request
    ) {
        RegisterResponse response = registrationService.register(request);

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ApiResponse.success(
                HttpStatus.CREATED.value(),
                "Account created successfully",
                response
            ));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<TokenResponse>> login(
        @Valid @RequestBody LoginRequest request,
        HttpServletRequest servletRequest
    ) {
        TokenResponse response = authenticationService.login(
            request,
            servletRequest.getHeader("User-Agent")
        );

        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK.value(),
                "Login successful",
                response
            )
        );
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<TokenResponse>> refresh(
        @Valid @RequestBody RefreshRequest request
    ) {
        TokenResponse response = authenticationService.refresh(request);

        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK.value(),
                "Token refreshed successfully",
                response
            )
        );
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
        @AuthenticationPrincipal Jwt jwt
    ) {
        authenticationService.logout(
            UUID.fromString(Objects.requireNonNull(jwt.getSubject())),
            UUID.fromString(Objects.requireNonNull(jwt.getClaimAsString("sid")))
        );

        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK.value(),
                "Logged out successfully",
                null
            )
        );
    }

    @GetMapping("/me")
    public Map<String, Object> me(
        @AuthenticationPrincipal Jwt jwt
    ) {
        return Map.of(
            "userId", Objects.requireNonNull(jwt.getSubject()),
            "sessionId", Objects.requireNonNull(jwt.getClaimAsString("sid")),
            "roles", Objects.requireNonNull(jwt.getClaimAsStringList("roles"))
        );
    }
}
