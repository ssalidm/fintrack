package za.co.pixelly.fintrack.finance.recurring.application;

public class RecurringTransactionNotFoundException
    extends RuntimeException {

    public RecurringTransactionNotFoundException() {
        super("Recurring transaction not found");
    }
}
