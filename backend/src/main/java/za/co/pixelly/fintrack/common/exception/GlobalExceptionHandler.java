package za.co.pixelly.fintrack.common.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.exc.InvalidFormatException;
import za.co.pixelly.fintrack.common.api.ApiResponse;
import za.co.pixelly.fintrack.finance.account.application.*;
import za.co.pixelly.fintrack.finance.category.application.*;
import za.co.pixelly.fintrack.finance.category.domain.TemplateCategoryTypeChangeException;
import za.co.pixelly.fintrack.finance.currency.application.InvalidCurrencyException;
import za.co.pixelly.fintrack.finance.transaction.application.*;
import za.co.pixelly.fintrack.finance.transfer.application.InactiveTransferAccountException;
import za.co.pixelly.fintrack.finance.transfer.application.TransferAccountCurrencyMismatchException;
import za.co.pixelly.fintrack.finance.transfer.application.TransferAlreadyVoidedException;
import za.co.pixelly.fintrack.finance.transfer.application.TransferNotFoundException;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DuplicateEmailException.class)
    ResponseEntity<ApiResponse<Void>> handleDuplicateEmail(DuplicateEmailException exception) {
        return ResponseEntity
            .status(HttpStatus.CONFLICT)
            .body(ApiResponse.error(
                HttpStatus.CONFLICT,
                exception.getMessage()
            ));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException exception) {
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
                HttpStatus.BAD_REQUEST,
                "Validation failed",
                errors
            ));
    }

    @ExceptionHandler({
        InvalidCredentialsException.class,
        InvalidRefreshTokenException.class
    })
    ResponseEntity<ApiResponse<Void>> handleUnauthorized(RuntimeException exception) {
        return ResponseEntity
            .status(HttpStatus.UNAUTHORIZED)
            .body(ApiResponse.error(
                HttpStatus.UNAUTHORIZED,
                exception.getMessage()
            ));
    }

    @ExceptionHandler(AccountNotActiveException.class)
    ResponseEntity<ApiResponse<Void>> handleInactiveAccount(AccountNotActiveException exception) {
        return ResponseEntity
            .status(HttpStatus.FORBIDDEN)
            .body(ApiResponse.error(
                HttpStatus.FORBIDDEN,
                exception.getMessage()
            ));
    }

    @ExceptionHandler(InvalidEmailVerificationTokenException.class)
    ResponseEntity<ApiResponse<Void>>
    handleInvalidEmailVerificationToken(InvalidEmailVerificationTokenException exception) {
        return ResponseEntity
            .badRequest()
            .body(
                ApiResponse.error(
                    HttpStatus.BAD_REQUEST,
                    exception.getMessage()
                )
            );
    }

    @ExceptionHandler(InvalidPasswordResetTokenException.class)
    ResponseEntity<ApiResponse<Void>>
    handleInvalidPasswordResetToken(InvalidPasswordResetTokenException exception) {
        return ResponseEntity
            .badRequest()
            .body(
                ApiResponse.error(
                    HttpStatus.BAD_REQUEST,
                    exception.getMessage()
                )
            );
    }

    @ExceptionHandler(AccountNotFoundException.class)
    ResponseEntity<ApiResponse<Void>>
    handleAccountNotFound(AccountNotFoundException exception) {
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(
                ApiResponse.error(
                    HttpStatus.NOT_FOUND,
                    exception.getMessage()
                )
            );
    }

    @ExceptionHandler(DuplicateAccountNameException.class)
    ResponseEntity<ApiResponse<Void>>
    handleDuplicateAccountName(DuplicateAccountNameException exception) {
        return ResponseEntity
            .status(HttpStatus.CONFLICT)
            .body(
                ApiResponse.error(
                    HttpStatus.CONFLICT,
                    exception.getMessage()
                )
            );
    }

    @ExceptionHandler(InvalidCurrencyException.class)
    ResponseEntity<ApiResponse<Void>>
    handleInvalidCurrency(InvalidCurrencyException exception) {
        return ResponseEntity
            .badRequest()
            .body(
                ApiResponse.error(
                    HttpStatus.BAD_REQUEST,
                    exception.getMessage()
                )
            );
    }

    @ExceptionHandler(StaleAccountVersionException.class)
    ResponseEntity<ApiResponse<Void>>
    handleStaleAccountVersion(StaleAccountVersionException exception) {
        return ResponseEntity
            .status(HttpStatus.CONFLICT)
            .body(
                ApiResponse.error(
                    HttpStatus.CONFLICT,
                    exception.getMessage()
                )
            );
    }

    @ExceptionHandler({
        AccountAlreadyArchivedException.class,
        ArchivedAccountModificationException.class
    })
    ResponseEntity<ApiResponse<Void>>
    handleAccountStateConflict(RuntimeException exception) {
        return ResponseEntity
            .status(HttpStatus.CONFLICT)
            .body(
                ApiResponse.error(
                    HttpStatus.CONFLICT,
                    exception.getMessage()
                )
            );
    }

    @ExceptionHandler(TemplateCategoryTypeChangeException.class)
    ResponseEntity<ApiResponse<Void>>
    handleTemplateCategoryTypeChange(TemplateCategoryTypeChangeException exception) {
        return ResponseEntity
            .status(HttpStatus.CONFLICT)
            .body(
                ApiResponse.error(
                    HttpStatus.CONFLICT,
                    exception.getMessage()
                )
            );
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Void>>
    handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {
        if (ex.getCause() instanceof InvalidFormatException ifx) {
            String fieldName = ifx.getPath().stream()
                .map(JacksonException.Reference::getPropertyName)
                .collect(Collectors.joining("."));

            if (ifx.getTargetType() != null && ifx.getTargetType().isEnum()) {
                String allowedValues = Arrays.toString(ifx.getTargetType().getEnumConstants());
                String message = String.format("Invalid value '%s'. Accepted values: %s",
                    ifx.getValue(), allowedValues);

                return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.validation(
                        HttpStatus.BAD_REQUEST,
                        "Invalid input format",
                        Map.of(fieldName, message)));
            }
        }

        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.error(
                HttpStatus.BAD_REQUEST,
                "Malformed JSON request body"
            ));
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
                    HttpStatus.CONFLICT,
                    "The resource was modified by another request"
                )
            );
    }

    @ExceptionHandler(CategoryNotFoundException.class)
    ResponseEntity<ApiResponse<Void>>
    handleCategoryNotFound(CategoryNotFoundException exception) {
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(
                ApiResponse.error(
                    HttpStatus.NOT_FOUND,
                    exception.getMessage()
                )
            );
    }

    @ExceptionHandler(DuplicateCategoryNameException.class)
    ResponseEntity<ApiResponse<Void>>
    handleDuplicateCategoryName(DuplicateCategoryNameException exception) {
        return ResponseEntity
            .status(HttpStatus.CONFLICT)
            .body(
                ApiResponse.error(
                    HttpStatus.CONFLICT,
                    exception.getMessage()
                )
            );
    }

    @ExceptionHandler(StaleCategoryVersionException.class)
    ResponseEntity<ApiResponse<Void>>
    handleStaleCategoryVersion(StaleCategoryVersionException exception) {
        return ResponseEntity
            .status(HttpStatus.CONFLICT)
            .body(
                ApiResponse.error(
                    HttpStatus.CONFLICT,
                    exception.getMessage()
                )
            );
    }

    @ExceptionHandler({
        CategoryAlreadyArchivedException.class,
        ArchivedCategoryModificationException.class
    })
    ResponseEntity<ApiResponse<Void>>
    handleCategoryStateConflict(RuntimeException exception) {
        return ResponseEntity
            .status(HttpStatus.CONFLICT)
            .body(
                ApiResponse.error(
                    HttpStatus.CONFLICT,
                    exception.getMessage()
                )
            );
    }

    @ExceptionHandler(TransactionNotFoundException.class)
    ResponseEntity<ApiResponse<Void>>
    handleTransactionNotFound(
        TransactionNotFoundException exception
    ) {
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(
                ApiResponse.error(
                    HttpStatus.NOT_FOUND,
                    exception.getMessage()
                )
            );
    }

    @ExceptionHandler({
        InactiveTransactionAccountException.class,
        InactiveTransactionCategoryException.class
    })
    ResponseEntity<ApiResponse<Void>>
    handleTransactionStateConflict(
        RuntimeException exception
    ) {
        return ResponseEntity
            .status(HttpStatus.CONFLICT)
            .body(
                ApiResponse.error(
                    HttpStatus.CONFLICT,
                    exception.getMessage()
                )
            );
    }

    @ExceptionHandler(TransactionCategoryTypeMismatchException.class)
    ResponseEntity<ApiResponse<Void>>
    handleTransactionCategoryMismatch(
        TransactionCategoryTypeMismatchException exception
    ) {
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(
                ApiResponse.error(
                    HttpStatus.BAD_REQUEST,
                    exception.getMessage()
                )
            );
    }

    @ExceptionHandler(StaleTransactionVersionException.class)
    ResponseEntity<ApiResponse<Void>>
    handleStaleTransactionVersion(
        StaleTransactionVersionException exception
    ) {
        return ResponseEntity
            .status(HttpStatus.CONFLICT)
            .body(
                ApiResponse.error(
                    HttpStatus.CONFLICT,
                    exception.getMessage()
                )
            );
    }

    @ExceptionHandler({
        TransactionAlreadyVoidedException.class,
        VoidedTransactionModificationException.class,
        TransferTransactionModificationException.class
    })
    ResponseEntity<ApiResponse<Void>>
    handleTransactionConflict(
        RuntimeException exception
    ) {
        return ResponseEntity
            .status(HttpStatus.CONFLICT)
            .body(
                ApiResponse.error(
                    HttpStatus.CONFLICT,
                    exception.getMessage()
                )
            );
    }

    @ExceptionHandler(TransferNotFoundException.class)
    ResponseEntity<ApiResponse<Void>>
    handleTransferNotFound(
        TransferNotFoundException exception
    ) {
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(
                ApiResponse.error(
                    HttpStatus.NOT_FOUND,
                    exception.getMessage()
                )
            );
    }

    @ExceptionHandler({
        TransferAlreadyVoidedException.class,
        InactiveTransferAccountException.class
    })
    ResponseEntity<ApiResponse<Void>>
    handleTransferConflict(
        RuntimeException exception
    ) {
        return ResponseEntity
            .status(HttpStatus.CONFLICT)
            .body(
                ApiResponse.error(
                    HttpStatus.CONFLICT,
                    exception.getMessage()
                )
            );
    }

    @ExceptionHandler(TransferAccountCurrencyMismatchException.class)
    ResponseEntity<ApiResponse<Void>>
    handleTransferCurrencyMismatch(
        TransferAccountCurrencyMismatchException exception
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

    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiResponse<Void>>
    handleServerError(Exception exception) {

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
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Internal server error"
                )
            );
    }
}
