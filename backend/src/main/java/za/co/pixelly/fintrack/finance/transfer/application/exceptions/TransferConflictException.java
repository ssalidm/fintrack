package za.co.pixelly.fintrack.finance.transfer.application.exceptions;

public class TransferConflictException extends RuntimeException {

    public TransferConflictException(String message) {
        super(message);
    }
}
