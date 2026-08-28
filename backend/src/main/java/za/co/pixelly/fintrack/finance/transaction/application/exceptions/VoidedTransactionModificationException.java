package za.co.pixelly.fintrack.finance.transaction.application.exceptions;

public class VoidedTransactionModificationException
    extends RuntimeException {

    public VoidedTransactionModificationException() {
        super("Voided transactions cannot be modified");
    }
}
