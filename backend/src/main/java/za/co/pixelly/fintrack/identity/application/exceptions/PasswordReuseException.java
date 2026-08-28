package za.co.pixelly.fintrack.identity.application.exceptions;

public class PasswordReuseException extends RuntimeException {

    public PasswordReuseException() {
        super("New password must be different from the current password");
    }
}
