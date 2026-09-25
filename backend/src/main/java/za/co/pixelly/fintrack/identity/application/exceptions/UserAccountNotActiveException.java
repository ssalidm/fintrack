package za.co.pixelly.fintrack.identity.application.exceptions;

public class UserAccountNotActiveException extends RuntimeException {
    public UserAccountNotActiveException() {
        super("Email verification is required before login");
    }
}
