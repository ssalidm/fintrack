package za.co.pixelly.fintrack.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import za.co.pixelly.fintrack.common.api.ApiResponse;

import java.util.LinkedHashMap;
import java.util.Map;

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
}
