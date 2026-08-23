package za.co.pixelly.fintrack.finance.transaction.application;

public class TransactionAlreadyVoidedException
    extends RuntimeException {

    public TransactionAlreadyVoidedException() {
        super("Transaction is already voided");
    }
}
