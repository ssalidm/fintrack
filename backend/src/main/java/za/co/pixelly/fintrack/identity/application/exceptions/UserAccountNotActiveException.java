package za.co.pixelly.fintrack.finance.account.application.exceptions;

public class AccountNotActiveException extends RuntimeException {
    public AccountNotActiveException() {
        super("Email verification is required before login");
    }
}
