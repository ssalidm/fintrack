package za.co.pixelly.fintrack.finance.transfer.application;

public class TransferAlreadyVoidedException
    extends RuntimeException {

    public TransferAlreadyVoidedException() {
        super("Transfer is already voided");
    }
}
