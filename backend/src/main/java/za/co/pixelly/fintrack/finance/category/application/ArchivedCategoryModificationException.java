package za.co.pixelly.fintrack.finance.category.application;

public class ArchivedCategoryModificationException
    extends RuntimeException {

    public ArchivedCategoryModificationException() {
        super(
            "Archived categories cannot be modified"
        );
    }
}
