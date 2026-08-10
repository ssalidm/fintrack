package za.co.pixelly.fintrack.common.api;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(
    boolean success,
    int status,
    String message,
    T result,
    Map<String, String> errors,
    Instant timestamp
) {

    public static <T> ApiResponse<T> success(
        int status,
        String message,
        T result
    ) {
        return new ApiResponse<>(
            true,
            status,
            message,
            result,
            null,
            Instant.now()
        );
    }

    public static ApiResponse<Void> error(
        int status,
        String message
    ) {
        return new ApiResponse<>(
            false,
            status,
            message,
            null,
            null,
            Instant.now()
        );
    }

    public static ApiResponse<Void> validation(
        int status,
        String message,
        Map<String, String> errors
    ) {
        return new ApiResponse<>(
            false,
            status,
            message,
            null,
            errors,
            Instant.now()
        );
    }
}
