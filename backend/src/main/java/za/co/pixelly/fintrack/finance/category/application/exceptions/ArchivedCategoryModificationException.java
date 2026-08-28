package za.co.pixelly.fintrack.finance.category.application.exceptions;

public class ArchivedCategoryModificationException
    extends RuntimeException {

    public ArchivedCategoryModificationException() {
        super(
            "Archived categories cannot be modified"
        );
    }
}
