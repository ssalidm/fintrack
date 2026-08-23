package za.co.pixelly.fintrack.finance.transfer.application;

public class InactiveTransferAccountException
    extends RuntimeException {

    public InactiveTransferAccountException() {
        super(
            "Transfers require active source and destination accounts"
        );
    }
}
