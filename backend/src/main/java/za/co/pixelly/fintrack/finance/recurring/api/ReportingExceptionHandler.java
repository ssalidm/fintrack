package za.co.pixelly.fintrack.reporting.api;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import za.co.pixelly.fintrack.common.api.ApiResponse;
import za.co.pixelly.fintrack.reporting.application.InvalidReportingRangeException;
import za.co.pixelly.fintrack.reporting.application.ReportingResourceNotFoundException;

@Order(Ordered.HIGHEST_PRECEDENCE + 30)
@RestControllerAdvice(
    basePackages = "za.co.pixelly.fintrack.reporting"
)
public class ReportingExceptionHandler {

    @ExceptionHandler(
        InvalidReportingRangeException.class
    )
    ResponseEntity<ApiResponse<Void>>
    handleInvalidRange(
        InvalidReportingRangeException exception
    ) {
        return error(
            HttpStatus.BAD_REQUEST,
            exception
        );
    }

    @ExceptionHandler(
        ReportingResourceNotFoundException.class
    )
    ResponseEntity<ApiResponse<Void>>
    handleResourceNotFound(
        ReportingResourceNotFoundException exception
    ) {
        return error(
            HttpStatus.NOT_FOUND,
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
