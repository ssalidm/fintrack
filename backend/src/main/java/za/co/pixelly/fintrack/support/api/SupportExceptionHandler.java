package za.co.pixelly.fintrack.support.api;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import za.co.pixelly.fintrack.common.api.ApiResponse;
import za.co.pixelly.fintrack.support.application.SupportRateLimitExceededException;
import za.co.pixelly.fintrack.support.security.SupportVerificationException;
import za.co.pixelly.fintrack.support.security.SupportVerificationUnavailableException;

@RestControllerAdvice
public class SupportExceptionHandler {

    @ExceptionHandler(
        SupportRateLimitExceededException.class
    )
    ResponseEntity<ApiResponse<Void>>
    handleRateLimit(
        SupportRateLimitExceededException exception
    ) {
        return ResponseEntity
            .status(
                HttpStatus.TOO_MANY_REQUESTS
            )
            .header(
                HttpHeaders.RETRY_AFTER,
                Long.toString(
                    exception
                        .retryAfterSeconds()
                )
            )
            .body(
                ApiResponse.error(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Too many support requests. Please try again later."
                )
            );
    }


    @ExceptionHandler(
        SupportVerificationException.class
    )
    ResponseEntity<ApiResponse<Void>>
    handleVerification(
        SupportVerificationException exception
    ) {
        return ResponseEntity
            .badRequest()
            .body(
                ApiResponse.error(
                    HttpStatus.BAD_REQUEST,
                    exception.getMessage()
                )
            );
    }


    @ExceptionHandler(
        SupportVerificationUnavailableException.class
    )
    ResponseEntity<ApiResponse<Void>>
    handleVerificationUnavailable(
        SupportVerificationUnavailableException exception
    ) {
        return ResponseEntity
            .status(
                HttpStatus.SERVICE_UNAVAILABLE
            )
            .body(
                ApiResponse.error(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "We cannot verify your request right now. Please try again shortly."
                )
            );
    }
}
