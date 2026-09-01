package za.co.pixelly.fintrack.finance.transaction.application.exceptions;

public class TransferTransactionModificationException
    extends RuntimeException {

    public TransferTransactionModificationException() {
        super(
            "Transfer transactions must be managed through the transfer API"
        );
    }
}
