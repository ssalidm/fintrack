package za.co.pixelly.fintrack.finance.transfer.application.exceptions;

public class TransferAccountCurrencyMismatchException
    extends RuntimeException {

    public TransferAccountCurrencyMismatchException() {
        super(
            "Transfers require source and destination accounts to use the same currency"
        );
    }
}
