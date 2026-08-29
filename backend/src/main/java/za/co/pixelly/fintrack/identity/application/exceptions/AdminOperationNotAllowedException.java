package za.co.pixelly.fintrack.identity.application.exceptions;

public class AdminOperationNotAllowedException extends RuntimeException {

    public AdminOperationNotAllowedException(
        String message
    ) {
        super(message);
    }
}
