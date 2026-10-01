package za.co.pixelly.fintrack.identity.application.exceptions;

public class DuplicateEmailException extends RuntimeException {
    public DuplicateEmailException() {
        super("Email address is already in use");
    }
}
