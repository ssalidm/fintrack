package za.co.pixelly.fintrack.identity.api;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import za.co.pixelly.fintrack.common.api.ApiResponse;
import za.co.pixelly.fintrack.identity.application.exceptions.UserAccountNotActiveException;
import za.co.pixelly.fintrack.identity.application.exceptions.AdminOperationNotAllowedException;
import za.co.pixelly.fintrack.identity.application.exceptions.AdminUserConflictException;
import za.co.pixelly.fintrack.identity.application.exceptions.AdminUserNotFoundException;
import za.co.pixelly.fintrack.identity.application.exceptions.DuplicateEmailException;
import za.co.pixelly.fintrack.identity.application.exceptions.EmailUnchangedException;
import za.co.pixelly.fintrack.identity.application.exceptions.InvalidCredentialsException;
import za.co.pixelly.fintrack.identity.application.exceptions.InvalidCurrentPasswordException;
import za.co.pixelly.fintrack.identity.application.exceptions.InvalidEmailVerificationTokenException;
import za.co.pixelly.fintrack.identity.application.exceptions.InvalidMfaAuthenticationException;
import za.co.pixelly.fintrack.identity.application.exceptions.InvalidMfaCodeException;
import za.co.pixelly.fintrack.identity.application.exceptions.InvalidPasswordResetTokenException;
import za.co.pixelly.fintrack.identity.application.exceptions.InvalidRefreshTokenException;
import za.co.pixelly.fintrack.identity.application.exceptions.InvalidRegistrationTokenException;
import za.co.pixelly.fintrack.identity.application.exceptions.MfaAlreadyEnabledException;
import za.co.pixelly.fintrack.identity.application.exceptions.MfaNotEnabledException;
import za.co.pixelly.fintrack.identity.application.exceptions.MfaRateLimitExceededException;
import za.co.pixelly.fintrack.identity.application.exceptions.MfaSetupNotStartedException;
import za.co.pixelly.fintrack.identity.application.exceptions.PasswordReuseException;
import za.co.pixelly.fintrack.identity.application.exceptions.UserNotFoundException;
import za.co.pixelly.fintrack.identity.application.exceptions.UserProfileConflictException;
import za.co.pixelly.fintrack.identity.application.exceptions.UserProfileNotFoundException;

@Order(Ordered.HIGHEST_PRECEDENCE + 10)
@RestControllerAdvice(
    basePackages = "za.co.pixelly.fintrack.identity"
)
public class IdentityExceptionHandler {

    @ExceptionHandler({
        InvalidRegistrationTokenException.class,
        InvalidEmailVerificationTokenException.class,
        InvalidPasswordResetTokenException.class,
        InvalidCurrentPasswordException.class,
        InvalidMfaCodeException.class
    })
    ResponseEntity<ApiResponse<Void>>
    handleBadRequest(
        RuntimeException exception
    ) {
        return error(
            HttpStatus.BAD_REQUEST,
            exception
        );
    }

    @ExceptionHandler({
        InvalidCredentialsException.class,
        InvalidRefreshTokenException.class,
        InvalidMfaAuthenticationException.class
    })
    ResponseEntity<ApiResponse<Void>>
    handleUnauthorized(
        RuntimeException exception
    ) {
        return error(
            HttpStatus.UNAUTHORIZED,
            exception
        );
    }

    @ExceptionHandler({
        UserAccountNotActiveException.class,
        AdminOperationNotAllowedException.class
    })
    ResponseEntity<ApiResponse<Void>>
    handleForbidden(
        RuntimeException exception
    ) {
        return error(
            HttpStatus.FORBIDDEN,
            exception
        );
    }

    @ExceptionHandler({
        UserProfileNotFoundException.class,
        UserNotFoundException.class,
        AdminUserNotFoundException.class
    })
    ResponseEntity<ApiResponse<Void>>
    handleNotFound(
        RuntimeException exception
    ) {
        return error(
            HttpStatus.NOT_FOUND,
            exception
        );
    }

    @ExceptionHandler({
        DuplicateEmailException.class,
        EmailUnchangedException.class,
        UserProfileConflictException.class,
        PasswordReuseException.class,
        AdminUserConflictException.class,
        MfaAlreadyEnabledException.class,
        MfaSetupNotStartedException.class,
        MfaNotEnabledException.class
    })
    ResponseEntity<ApiResponse<Void>>
    handleConflict(
        RuntimeException exception
    ) {
        return error(
            HttpStatus.CONFLICT,
            exception
        );
    }

    @ExceptionHandler(
        MfaRateLimitExceededException.class
    )
    ResponseEntity<ApiResponse<Void>>
    handleRateLimitExceeded(
        MfaRateLimitExceededException exception
    ) {
        return error(
            HttpStatus.TOO_MANY_REQUESTS,
            exception
        );
    }

    private ResponseEntity<ApiResponse<Void>>
    error(
        HttpStatus status,
        RuntimeException exception
    ) {
        return ResponseEntity
            .status(status)
            .body(
                ApiResponse.error(
                    status,
                    exception.getMessage()
                )
            );
    }
}
