package za.co.pixelly.fintrack.finance.transaction.application.exceptions;

public class StaleTransactionVersionException
    extends RuntimeException {

    public StaleTransactionVersionException() {
        super(
            "The transaction has changed since it was last retrieved"
        );
    }
}
