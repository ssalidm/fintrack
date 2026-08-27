package za.co.pixelly.fintrack.finance.recurring.application;

public class RecurringTransactionValidationException
    extends RuntimeException {

    public RecurringTransactionValidationException(
        String message
    ) {
        super(message);
    }
}
