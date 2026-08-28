package za.co.pixelly.fintrack.finance.account.application.exceptions;

public class AccountNotFoundException
    extends RuntimeException {

    public AccountNotFoundException() {
        super("Account not found");
    }
}
