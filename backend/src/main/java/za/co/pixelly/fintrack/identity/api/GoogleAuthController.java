package za.co.pixelly.fintrack.identity.api;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import za.co.pixelly.fintrack.common.api.ApiMessage;
import za.co.pixelly.fintrack.common.api.ApiResponse;
import za.co.pixelly.fintrack.identity.application.google.GoogleAuthenticationService;

@RestController
@RequestMapping("/auth/google")
@RequiredArgsConstructor
public class GoogleAuthController {

    private final GoogleAuthenticationService googleAuthenticationService;


    @PostMapping
    public ResponseEntity<ApiResponse<LoginResponse>>
    login(
        @Valid
        @RequestBody
        GoogleLoginRequest request,
        HttpServletRequest servletRequest
    ) {
        LoginResponse response =
            googleAuthenticationService
                .login(
                    request.credential(),
                    servletRequest.getHeader(
                        "User-Agent"
                    )
                );

        return ResponseEntity.ok(
            ApiResponse.success(
                HttpStatus.OK,
                message(response.status()),
                response
            )
        );
    }


    private String message(
        LoginStatus status
    ) {
        return switch (status) {

            case AUTHENTICATED -> ApiMessage.Auth.LOGIN_SUCCESS;
            case MFA_REQUIRED -> ApiMessage.Auth.TFA_REQUIRED;
            case EMAIL_VERIFICATION_REQUIRED -> ApiMessage.Auth.EMAIL_VERIFICATION_REQUIRED;
            case ACCOUNT_LINK_REQUIRED -> ApiMessage.Auth.ACCOUNT_LINK_REQUIRED;
        };
    }
}
