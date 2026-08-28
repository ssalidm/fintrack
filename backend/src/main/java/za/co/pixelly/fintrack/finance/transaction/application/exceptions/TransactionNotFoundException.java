package za.co.pixelly.fintrack.finance.transaction.application.exceptions;

public class TransactionNotFoundException
    extends RuntimeException {

    public TransactionNotFoundException() {
        super("Transaction not found");
    }
}
