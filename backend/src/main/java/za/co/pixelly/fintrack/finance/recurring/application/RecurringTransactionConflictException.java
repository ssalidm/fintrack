package za.co.pixelly.fintrack.finance.recurring.application;

public class RecurringTransactionConflictException
    extends RuntimeException {

    public RecurringTransactionConflictException(
        String message
    ) {
        super(message);
    }
}
