package za.co.pixelly.fintrack.finance.recurring.application.exceptions;

public class RecurringTransactionConflictException
    extends RuntimeException {

    public RecurringTransactionConflictException(
        String message
    ) {
        super(message);
    }
}
