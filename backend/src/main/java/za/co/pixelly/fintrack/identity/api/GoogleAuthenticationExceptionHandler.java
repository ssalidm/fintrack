package za.co.pixelly.fintrack.identity.api;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import za.co.pixelly.fintrack.common.api.ApiResponse;
import za.co.pixelly.fintrack.identity.application.google.GoogleAuthenticationUnavailableException;
import za.co.pixelly.fintrack.identity.application.google.InvalidGoogleCredentialException;

@Order(Ordered.HIGHEST_PRECEDENCE)
@RestControllerAdvice(assignableTypes = GoogleAuthController.class)
public class GoogleAuthenticationExceptionHandler {

    @ExceptionHandler(InvalidGoogleCredentialException.class)
    ResponseEntity<ApiResponse<Void>>
    handleInvalidCredential(
        InvalidGoogleCredentialException exception
    ) {
        return ResponseEntity
            .status(
                HttpStatus.UNAUTHORIZED
            )
            .body(
                ApiResponse.error(
                    HttpStatus.UNAUTHORIZED,
                    exception.getMessage()
                )
            );
    }


    @ExceptionHandler(GoogleAuthenticationUnavailableException.class)
    ResponseEntity<ApiResponse<Void>>
    handleUnavailable(
        GoogleAuthenticationUnavailableException exception
    ) {
        return ResponseEntity
            .status(
                HttpStatus.SERVICE_UNAVAILABLE
            )
            .body(
                ApiResponse.error(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Google authentication is temporarily unavailable"
                )
            );
    }
}
