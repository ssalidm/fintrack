package za.co.pixelly.fintrack.finance.transaction.application.exceptions;

public class InactiveTransactionCategoryException
    extends RuntimeException {

    public InactiveTransactionCategoryException() {
        super(
            "Transactions can only use an active category"
        );
    }
}
