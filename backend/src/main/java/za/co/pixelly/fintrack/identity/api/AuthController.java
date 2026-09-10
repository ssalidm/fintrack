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
import za.co.pixelly.fintrack.common.api.ApiMessage;
import za.co.pixelly.fintrack.common.api.ApiResponse;
import za.co.pixelly.fintrack.identity.application.AuthenticationService;
import za.co.pixelly.fintrack.identity.application.EmailVerificationService;
import za.co.pixelly.fintrack.identity.application.PasswordResetService;
import za.co.pixelly.fintrack.identity.application.UserRegistrationService;
import za.co.pixelly.fintrack.identity.application.emailchange.EmailChangeService;
import za.co.pixelly.fintrack.identity.application.mfa.MfaLoginService;
import za.co.pixelly.fintrack.identity.application.mfa.MfaManagementService;
import za.co.pixelly.fintrack.identity.application.mfa.MfaSetupService;

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
    private final MfaSetupService mfaSetupService;
    private final MfaLoginService mfaLoginService;
    private final MfaManagementService mfaManagementService;
    private final EmailChangeService emailChangeService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<RegisterResponse>> register(
        @Valid @RequestBody RegisterRequest request
    ) {
        RegisterResponse response = registrationService.register(request);

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ApiResponse.success(
                HttpStatus.CREATED,
                ApiMessage.Auth.REGISTER_SUCCESS,
                response
            ));
    }


    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
        @Valid @RequestBody LoginRequest request,
        HttpServletRequest servletRequest
    ) {
        LoginResponse response =
            authenticationService.login
                (
                    request,
                    servletRequest.getHeader("User-Agent")
                );

        String message = response.status() == LoginStatus.MFA_REQUIRED
            ? ApiMessage.Auth.TFA_REQUIRED
            : ApiMessage.Auth.LOGIN_SUCCESS;

        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                message,
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
                ApiMessage.Auth.REFRESH_SUCCESS,
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
                ApiMessage.Auth.LOGOUT_SUCCESS,
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
                ApiMessage.Auth.VERIFY_SUCCESS,
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
                    ApiMessage.Auth.RESEND_VERIFY,
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
                    ApiMessage.Auth.FORGOT_PASSWORD,
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
                ApiMessage.Auth.RESET_SUCCESS,
                null
            )
        );
    }


    @PostMapping("/change-email/confirm")
    public ResponseEntity<ApiResponse<Void>> confirmEmailChange(
        @Valid
        @RequestBody
        ConfirmEmailChangeRequest request
    ) {
        emailChangeService.confirm(
            request.token()
        );

        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Auth.EMAIL_CHANGED,
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


    @PostMapping("/mfa/setup")
    public ResponseEntity<ApiResponse<MfaSetupResponse>>
    startMfaSetup(
        @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Auth.TFA_SETUP,
                mfaSetupService.startSetup(userId(jwt))
            )
        );
    }


    @PostMapping("/mfa/setup/confirm")
    public ResponseEntity<ApiResponse<MfaSetupConfirmResponse>>
    confirmMfaSetup(
        @AuthenticationPrincipal Jwt jwt,
        @Valid @RequestBody MfaSetupConfirmRequest request
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                "Two-factor authentication enabled",
                mfaSetupService.confirmSetup(userId(jwt), request.code())
            )
        );
    }


    @PostMapping("/mfa/verify")
    public ResponseEntity<ApiResponse<TokenResponse>>
    verifyMfa(
        @Valid
        @RequestBody
        MfaVerifyRequest request
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Auth.LOGIN_SUCCESS,
                mfaLoginService.verify(request.challengeToken(), request.code())
            )
        );
    }


    @PostMapping("/mfa/recover")
    public ResponseEntity<ApiResponse<TokenResponse>>
    recoverMfa(
        @Valid
        @RequestBody
        MfaRecoverRequest request
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Auth.LOGIN_SUCCESS,
                mfaLoginService.recover(request.challengeToken(), request.recoveryCode())
            )
        );
    }


    @GetMapping("/mfa/status")
    public ResponseEntity<ApiResponse<MfaStatusResponse>>
    getMfaStatus(
        @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId =
            UUID.fromString(
                Objects.requireNonNull(
                    jwt.getSubject()
                )
            );

        MfaStatusResponse response =
            mfaManagementService.status(
                userId
            );

        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Auth.TFA_STATUS_FETCHED,
                response
            )
        );
    }


    @PostMapping("/mfa/disable")
    public ResponseEntity<ApiResponse<Void>>
    disableMfa(
        @AuthenticationPrincipal Jwt jwt,
        @Valid
        @RequestBody
        MfaDisableRequest request
    ) {
        mfaManagementService.disable(
            userId(jwt),
            request.currentPassword(),
            request.mfaCode()
        );

        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Auth.TFA_DISABLED,
                null
            )
        );
    }


    @PostMapping("/mfa/recovery-codes/regenerate")
    public ResponseEntity<ApiResponse<MfaRecoveryCodesResponse>>
    regenerateMfaRecoveryCodes(
        @AuthenticationPrincipal Jwt jwt,
        @Valid
        @RequestBody
        MfaRecoveryCodesRegenerateRequest request
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                ApiMessage.Auth.TFA_CODES_GENERATED,
                mfaManagementService
                    .regenerateRecoveryCodes(
                        userId(jwt),
                        request.currentPassword(),
                        request.code()
                    )
            )
        );
    }


    private UUID userId(Jwt jwt) {
        return UUID.fromString(Objects.requireNonNull(jwt.getSubject()));
    }
}
