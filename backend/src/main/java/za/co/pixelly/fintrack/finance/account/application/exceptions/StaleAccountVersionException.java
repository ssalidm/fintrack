package za.co.pixelly.fintrack.finance.account.application.exceptions;

public class StaleAccountVersionException
    extends RuntimeException {

    public StaleAccountVersionException() {
        super(
            "The account has changed since it was last retrieved"
        );
    }
}
