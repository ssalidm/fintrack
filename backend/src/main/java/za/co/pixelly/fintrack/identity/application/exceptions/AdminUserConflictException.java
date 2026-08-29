package za.co.pixelly.fintrack.identity.application.exceptions;

public class AdminUserConflictException extends RuntimeException {

    public AdminUserConflictException(
        String message
    ) {
        super(message);
    }
}
