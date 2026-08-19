package za.co.pixelly.fintrack.identity.api;

import io.swagger.v3.oas.annotations.tags.Tag;
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
import za.co.pixelly.fintrack.identity.application.EmailVerificationService;
import za.co.pixelly.fintrack.identity.application.PasswordResetService;
import za.co.pixelly.fintrack.identity.application.UserRegistrationService;

import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@Tag(
    name = "Authentication",
    description = "Registration, authentication and account security"
)
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRegistrationService registrationService;
    private final AuthenticationService authenticationService;
    private final EmailVerificationService emailVerificationService;
    private final PasswordResetService passwordResetService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<RegisterResponse>> register(
        @Valid @RequestBody RegisterRequest request
    ) {
        RegisterResponse response = registrationService.register(request);

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ApiResponse.success(
                HttpStatus.CREATED,
                "User registered successfully",
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
                HttpStatus.OK,
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
                HttpStatus.OK,
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
                HttpStatus.OK,
                "Logged out successfully",
                null
            )
        );
    }


    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(
        @Valid @RequestBody VerifyEmailRequest request
    ) {
        emailVerificationService.verify(
            request.token()
        );

        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                "Email verified successfully",
                null
            )
        );
    }


    @PostMapping("/resend-verification")
    public ResponseEntity<ApiResponse<Void>>
    resendVerification(
        @Valid
        @RequestBody
        ResendVerificationRequest request
    ) {
        emailVerificationService.resend(
            request.email()
        );

        return ResponseEntity
            .status(HttpStatus.ACCEPTED)
            .body(
                ApiResponse.success(
                    HttpStatus.ACCEPTED,
                    "If an eligible account exists, a verification email will be sent",
                    null
                )
            );
    }


    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
        @Valid
        @RequestBody
        ForgotPasswordRequest request
    ) {
        passwordResetService.requestReset(
            request.email()
        );

        return ResponseEntity
            .status(HttpStatus.ACCEPTED)
            .body(
                ApiResponse.success(
                    HttpStatus.ACCEPTED,
                    "If an eligible account exists, password reset instructions will be sent",
                    null
                )
            );
    }


    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
        @Valid
        @RequestBody
        ResetPasswordRequest request
    ) {
        passwordResetService.resetPassword(
            request.token(),
            request.newPassword()
        );

        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                "Password reset successfully. Please log in again.",
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
