package za.co.pixelly.fintrack.finance.recurring.application.exceptions;

public class RecurringTransactionNotFoundException
    extends RuntimeException {

    public RecurringTransactionNotFoundException() {
        super("Recurring transaction not found");
    }
}
