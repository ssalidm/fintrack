package za.co.pixelly.fintrack.finance.transaction.application.exceptions;

public class TransactionAlreadyVoidedException
    extends RuntimeException {

    public TransactionAlreadyVoidedException() {
        super("Transaction is already voided");
    }
}
