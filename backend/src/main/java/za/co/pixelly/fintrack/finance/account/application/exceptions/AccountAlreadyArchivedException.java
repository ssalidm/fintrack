package za.co.pixelly.fintrack.finance.account.application.exceptions;

public class AccountAlreadyArchivedException
    extends RuntimeException {

    public AccountAlreadyArchivedException() {
        super("Account is already archived");
    }
}
