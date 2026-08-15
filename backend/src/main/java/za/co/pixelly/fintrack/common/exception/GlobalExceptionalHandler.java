package za.co.pixelly.fintrack.common.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import za.co.pixelly.fintrack.common.api.ApiResponse;
import za.co.pixelly.fintrack.finance.account.application.*;
import za.co.pixelly.fintrack.finance.currency.application.InvalidCurrencyException;

import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionalHandler {

    @ExceptionHandler(DuplicateEmailException.class)
    ResponseEntity<ApiResponse<Void>> handleDuplicateEmail(
        DuplicateEmailException exception
    ) {
        return ResponseEntity
            .status(HttpStatus.CONFLICT)
            .body(ApiResponse.error(
                HttpStatus.CONFLICT.value(),
                exception.getMessage()
            ));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiResponse<Void>> handleValidation(
        MethodArgumentNotValidException exception
    ) {
        Map<String, String> errors = new LinkedHashMap<>();

        exception.getBindingResult()
            .getFieldErrors()
            .forEach(error ->
                errors.putIfAbsent(
                    error.getField(),
                    error.getDefaultMessage()
                )
            );

        return ResponseEntity
            .badRequest()
            .body(ApiResponse.validation(
                HttpStatus.BAD_REQUEST.value(),
                "Validation failed",
                errors
            ));
    }

    @ExceptionHandler({
        InvalidCredentialsException.class,
        InvalidRefreshTokenException.class
    })
    ResponseEntity<ApiResponse<Void>> handleUnauthorized(
        RuntimeException exception
    ) {
        return ResponseEntity
            .status(HttpStatus.UNAUTHORIZED)
            .body(ApiResponse.error(
                HttpStatus.UNAUTHORIZED.value(),
                exception.getMessage()
            ));
    }

    @ExceptionHandler(AccountNotActiveException.class)
    ResponseEntity<ApiResponse<Void>> handleInactiveAccount(
        AccountNotActiveException exception
    ) {
        return ResponseEntity
            .status(HttpStatus.FORBIDDEN)
            .body(ApiResponse.error(
                HttpStatus.FORBIDDEN.value(),
                exception.getMessage()
            ));
    }

    @ExceptionHandler(InvalidEmailVerificationTokenException.class)
    ResponseEntity<ApiResponse<Void>>
    handleInvalidEmailVerificationToken(
        InvalidEmailVerificationTokenException exception
    ) {
        return ResponseEntity
            .badRequest()
            .body(
                ApiResponse.error(
                    HttpStatus.BAD_REQUEST.value(),
                    exception.getMessage()
                )
            );
    }

    @ExceptionHandler(InvalidPasswordResetTokenException.class)
    ResponseEntity<ApiResponse<Void>>
    handleInvalidPasswordResetToken(
        InvalidPasswordResetTokenException exception
    ) {
        return ResponseEntity
            .badRequest()
            .body(
                ApiResponse.error(
                    HttpStatus.BAD_REQUEST.value(),
                    exception.getMessage()
                )
            );
    }

    @ExceptionHandler(AccountNotFoundException.class)
    ResponseEntity<ApiResponse<Void>>
    handleAccountNotFound(
        AccountNotFoundException exception
    ) {
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(
                ApiResponse.error(
                    HttpStatus.NOT_FOUND.value(),
                    exception.getMessage()
                )
            );
    }

    @ExceptionHandler(DuplicateAccountNameException.class)
    ResponseEntity<ApiResponse<Void>>
    handleDuplicateAccountName(
        DuplicateAccountNameException exception
    ) {
        return ResponseEntity
            .status(HttpStatus.CONFLICT)
            .body(
                ApiResponse.error(
                    HttpStatus.CONFLICT.value(),
                    exception.getMessage()
                )
            );
    }

    @ExceptionHandler(InvalidCurrencyException.class)
    ResponseEntity<ApiResponse<Void>>
    handleInvalidCurrency(
        InvalidCurrencyException exception
    ) {
        return ResponseEntity
            .badRequest()
            .body(
                ApiResponse.error(
                    HttpStatus.BAD_REQUEST.value(),
                    exception.getMessage()
                )
            );
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiResponse<Void>>
    handleServerError(
        Exception exception
    ) {

        log.error(
            """
                INTERNAL SERVER ERROR
                Error={}
                """,
            exception.getMessage(), exception
        );

        return ResponseEntity
            .internalServerError()
            .body(
                ApiResponse.error(
                    HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Internal server error"
                )
            );
    }

    @ExceptionHandler(StaleAccountVersionException.class)
    ResponseEntity<ApiResponse<Void>>
    handleStaleAccountVersion(
        StaleAccountVersionException exception
    ) {
        return ResponseEntity
            .status(HttpStatus.CONFLICT)
            .body(
                ApiResponse.error(
                    HttpStatus.CONFLICT.value(),
                    exception.getMessage()
                )
            );
    }

    @ExceptionHandler({
        AccountAlreadyArchivedException.class,
        ArchivedAccountModificationException.class
    })
    ResponseEntity<ApiResponse<Void>>
    handleAccountStateConflict(
        RuntimeException exception
    ) {
        return ResponseEntity
            .status(HttpStatus.CONFLICT)
            .body(
                ApiResponse.error(
                    HttpStatus.CONFLICT.value(),
                    exception.getMessage()
                )
            );
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<ApiResponse<Void>>
    handleMessageNotReadable(
        HttpMessageNotReadableException exception
    ) {
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(
                ApiResponse.error(
                    HttpStatus.BAD_REQUEST.value(),
                    "Required body is missing"
                )
            );
    }

    @ExceptionHandler(
        org.springframework.orm.ObjectOptimisticLockingFailureException.class
    )
    ResponseEntity<ApiResponse<Void>>
    handleOptimisticLockFailure(
        org.springframework.orm.ObjectOptimisticLockingFailureException exception
    ) {
        return ResponseEntity
            .status(HttpStatus.CONFLICT)
            .body(
                ApiResponse.error(
                    HttpStatus.CONFLICT.value(),
                    "The resource was modified by another request"
                )
            );
    }
}
