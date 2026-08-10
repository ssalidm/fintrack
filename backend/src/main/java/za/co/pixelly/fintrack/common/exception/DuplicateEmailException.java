package za.co.pixelly.fintrack.common.exception;

public class DuplicateEmailException extends RuntimeException {
    public DuplicateEmailException() {
        super("An account with this email already exists");
    }
}
