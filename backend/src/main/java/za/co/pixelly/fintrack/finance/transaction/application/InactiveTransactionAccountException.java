package za.co.pixelly.fintrack.finance.transaction.application;

public class InactiveTransactionAccountException
    extends RuntimeException {

    public InactiveTransactionAccountException() {
        super(
            "Transactions can only be posted to an active account"
        );
    }
}
