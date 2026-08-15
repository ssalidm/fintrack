package za.co.pixelly.fintrack.finance.account.application;

public class ArchivedAccountModificationException
    extends RuntimeException {

    public ArchivedAccountModificationException() {
        super("Archived accounts cannot be modified");
    }
}
