package za.co.pixelly.fintrack.common.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.exc.InvalidFormatException;
import za.co.pixelly.fintrack.common.api.ApiResponse;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Order(Ordered.LOWEST_PRECEDENCE)
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(
        MethodArgumentNotValidException.class
    )
    ResponseEntity<ApiResponse<Void>>
    handleValidation(
        MethodArgumentNotValidException exception
    ) {
        Map<String, String> errors =
            new LinkedHashMap<>();

        exception
            .getBindingResult()
            .getFieldErrors()
            .forEach(error ->
                errors.putIfAbsent(
                    error.getField(),
                    error.getDefaultMessage()
                )
            );

        return ResponseEntity
            .badRequest()
            .body(
                ApiResponse.validation(
                    HttpStatus.BAD_REQUEST,
                    "Validation failed",
                    errors
                )
            );
    }

    @ExceptionHandler(
        HttpMessageNotReadableException.class
    )
    ResponseEntity<ApiResponse<Void>>
    handleHttpMessageNotReadable(
        HttpMessageNotReadableException exception
    ) {
        if (
            exception.getCause()
                instanceof InvalidFormatException invalidFormatException
        ) {
            String fieldName =
                invalidFormatException
                    .getPath()
                    .stream()
                    .map(
                        JacksonException.Reference
                            ::getPropertyName
                    )
                    .collect(
                        Collectors.joining(".")
                    );

            if (
                invalidFormatException
                    .getTargetType() != null
                    &&
                    invalidFormatException
                        .getTargetType()
                        .isEnum()
            ) {
                String allowedValues =
                    Arrays.toString(
                        invalidFormatException
                            .getTargetType()
                            .getEnumConstants()
                    );

                String message =
                    "Invalid value '%s'. Accepted values: %s"
                        .formatted(
                            invalidFormatException
                                .getValue(),
                            allowedValues
                        );

                return ResponseEntity
                    .badRequest()
                    .body(
                        ApiResponse.validation(
                            HttpStatus.BAD_REQUEST,
                            "Invalid input format",
                            Map.of(
                                fieldName,
                                message
                            )
                        )
                    );
            }
        }

        return ResponseEntity
            .badRequest()
            .body(
                ApiResponse.error(
                    HttpStatus.BAD_REQUEST,
                    "Malformed JSON request body"
                )
            );
    }

    @ExceptionHandler(
        ObjectOptimisticLockingFailureException.class
    )
    ResponseEntity<ApiResponse<Void>>
    handleOptimisticLockFailure(
        ObjectOptimisticLockingFailureException exception
    ) {
        return ResponseEntity
            .status(
                HttpStatus.CONFLICT
            )
            .body(
                ApiResponse.error(
                    HttpStatus.CONFLICT,
                    "The resource was modified by another request"
                )
            );
    }

    @ExceptionHandler(
        NoResourceFoundException.class
    )
    ResponseEntity<ApiResponse<Void>>
    handleNoResourceFound(
        NoResourceFoundException exception
    ) {
        return ResponseEntity
            .status(
                HttpStatus.NOT_FOUND
            )
            .body(
                ApiResponse.error(
                    HttpStatus.NOT_FOUND,
                    "Resource not found: /"
                        + exception
                        .getResourcePath()
                )
            );
    }

    @ExceptionHandler(
        MethodArgumentTypeMismatchException.class
    )
    ResponseEntity<ApiResponse<Void>>
    handleMethodArgumentTypeMismatch(
        MethodArgumentTypeMismatchException exception
    ) {
        String message =
            "Invalid value for parameter '%s'"
                .formatted(
                    exception.getName()
                );

        return ResponseEntity
            .badRequest()
            .body(
                ApiResponse.validation(
                    HttpStatus.BAD_REQUEST,
                    "Invalid request parameter",
                    Map.of(
                        exception.getName(),
                        message
                    )
                )
            );
    }

    @ExceptionHandler(
        MissingServletRequestParameterException.class
    )
    ResponseEntity<ApiResponse<Void>>
    handleMissingRequestParameter(
        MissingServletRequestParameterException exception
    ) {
        return ResponseEntity
            .badRequest()
            .body(
                ApiResponse.validation(
                    HttpStatus.BAD_REQUEST,
                    "Missing required parameter",
                    Map.of(
                        exception
                            .getParameterName(),
                        "Required parameter is missing"
                    )
                )
            );
    }

    @ExceptionHandler(
        HandlerMethodValidationException.class
    )
    ResponseEntity<ApiResponse<Void>>
    handleMethodValidation(
        HandlerMethodValidationException exception
    ) {
        return ResponseEntity
            .badRequest()
            .body(
                ApiResponse.error(
                    HttpStatus.BAD_REQUEST,
                    "Request validation failed"
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
            exception.getMessage(),
            exception
        );

        return ResponseEntity
            .internalServerError()
            .body(
                ApiResponse.error(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Internal server error"
                )
            );
    }
}
