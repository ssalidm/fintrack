package za.co.pixelly.fintrack.finance.account.application;

public class DuplicateAccountNameException
    extends RuntimeException {

    public DuplicateAccountNameException() {
        super(
            "An active account with this name already exists"
        );
    }
}
