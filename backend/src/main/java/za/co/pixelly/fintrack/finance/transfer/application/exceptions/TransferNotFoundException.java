package za.co.pixelly.fintrack.finance.transfer.application.exceptions;

public class TransferNotFoundException extends RuntimeException {
    public TransferNotFoundException() {
        super("Transfer not found");
    }
}
