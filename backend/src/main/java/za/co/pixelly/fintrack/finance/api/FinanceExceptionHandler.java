package za.co.pixelly.fintrack.finance.api;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import za.co.pixelly.fintrack.common.api.ApiResponse;
import za.co.pixelly.fintrack.finance.account.application.exceptions.AccountAlreadyArchivedException;
import za.co.pixelly.fintrack.finance.account.application.exceptions.AccountNotFoundException;
import za.co.pixelly.fintrack.finance.account.application.exceptions.ArchivedAccountModificationException;
import za.co.pixelly.fintrack.finance.account.application.exceptions.DuplicateAccountNameException;
import za.co.pixelly.fintrack.finance.account.application.exceptions.StaleAccountVersionException;
import za.co.pixelly.fintrack.finance.budget.application.exceptions.BudgetConflictException;
import za.co.pixelly.fintrack.finance.budget.application.exceptions.BudgetLimitNotFoundException;
import za.co.pixelly.fintrack.finance.budget.application.exceptions.BudgetNotFoundException;
import za.co.pixelly.fintrack.finance.budget.application.exceptions.BudgetValidationException;
import za.co.pixelly.fintrack.finance.category.application.exceptions.ArchivedCategoryModificationException;
import za.co.pixelly.fintrack.finance.category.application.exceptions.CategoryAlreadyArchivedException;
import za.co.pixelly.fintrack.finance.category.application.exceptions.CategoryNotFoundException;
import za.co.pixelly.fintrack.finance.category.application.exceptions.DuplicateCategoryNameException;
import za.co.pixelly.fintrack.finance.category.application.exceptions.StaleCategoryVersionException;
import za.co.pixelly.fintrack.finance.category.domain.TemplateCategoryTypeChangeException;
import za.co.pixelly.fintrack.finance.currency.application.InvalidCurrencyException;
import za.co.pixelly.fintrack.finance.goal.application.exceptions.GoalContributionNotFoundException;
import za.co.pixelly.fintrack.finance.goal.application.exceptions.SavingsGoalConflictException;
import za.co.pixelly.fintrack.finance.goal.application.exceptions.SavingsGoalNotFoundException;
import za.co.pixelly.fintrack.finance.goal.application.exceptions.SavingsGoalValidationException;
import za.co.pixelly.fintrack.finance.recurring.application.exceptions.RecurringTransactionConflictException;
import za.co.pixelly.fintrack.finance.recurring.application.exceptions.RecurringTransactionNotFoundException;
import za.co.pixelly.fintrack.finance.recurring.application.exceptions.RecurringTransactionValidationException;
import za.co.pixelly.fintrack.finance.transaction.application.exceptions.InactiveTransactionAccountException;
import za.co.pixelly.fintrack.finance.transaction.application.exceptions.InactiveTransactionCategoryException;
import za.co.pixelly.fintrack.finance.transaction.application.exceptions.StaleTransactionVersionException;
import za.co.pixelly.fintrack.finance.transaction.application.exceptions.TransactionAlreadyVoidedException;
import za.co.pixelly.fintrack.finance.transaction.application.exceptions.TransactionCategoryTypeMismatchException;
import za.co.pixelly.fintrack.finance.transaction.application.exceptions.TransactionNotFoundException;
import za.co.pixelly.fintrack.finance.transaction.application.exceptions.TransferTransactionModificationException;
import za.co.pixelly.fintrack.finance.transaction.application.exceptions.VoidedTransactionModificationException;
import za.co.pixelly.fintrack.finance.transfer.application.exceptions.InactiveTransferAccountException;
import za.co.pixelly.fintrack.finance.transfer.application.exceptions.TransferAccountCurrencyMismatchException;
import za.co.pixelly.fintrack.finance.transfer.application.exceptions.TransferAlreadyVoidedException;
import za.co.pixelly.fintrack.finance.transfer.application.exceptions.TransferConflictException;
import za.co.pixelly.fintrack.finance.transfer.application.exceptions.TransferNotFoundException;

@Order(Ordered.HIGHEST_PRECEDENCE + 20)
@RestControllerAdvice(
    basePackages = "za.co.pixelly.fintrack.finance"
)
public class FinanceExceptionHandler {

    @ExceptionHandler({
        AccountNotFoundException.class,
        CategoryNotFoundException.class,
        TransactionNotFoundException.class,
        TransferNotFoundException.class,
        BudgetNotFoundException.class,
        BudgetLimitNotFoundException.class,
        SavingsGoalNotFoundException.class,
        GoalContributionNotFoundException.class,
        RecurringTransactionNotFoundException.class
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
        DuplicateAccountNameException.class,
        StaleAccountVersionException.class,
        AccountAlreadyArchivedException.class,
        ArchivedAccountModificationException.class,

        DuplicateCategoryNameException.class,
        StaleCategoryVersionException.class,
        CategoryAlreadyArchivedException.class,
        ArchivedCategoryModificationException.class,
        TemplateCategoryTypeChangeException.class,

        InactiveTransactionAccountException.class,
        InactiveTransactionCategoryException.class,
        StaleTransactionVersionException.class,
        TransactionAlreadyVoidedException.class,
        VoidedTransactionModificationException.class,
        TransferTransactionModificationException.class,

        TransferAlreadyVoidedException.class,
        InactiveTransferAccountException.class,
        TransferConflictException.class,

        BudgetConflictException.class,
        SavingsGoalConflictException.class,
        RecurringTransactionConflictException.class
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

    @ExceptionHandler({
        InvalidCurrencyException.class,
        TransactionCategoryTypeMismatchException.class,
        TransferAccountCurrencyMismatchException.class,
        BudgetValidationException.class,
        SavingsGoalValidationException.class,
        RecurringTransactionValidationException.class
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
