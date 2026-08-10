package za.co.pixelly.fintrack.common.exception;

public class AccountNotActiveException extends RuntimeException {
    public AccountNotActiveException() {
        super("Email verification is required before login");
    }
}
