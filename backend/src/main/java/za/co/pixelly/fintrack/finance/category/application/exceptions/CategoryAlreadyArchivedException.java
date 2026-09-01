package za.co.pixelly.fintrack.finance.category.application.exceptions;

public class CategoryAlreadyArchivedException
    extends RuntimeException {

    public CategoryAlreadyArchivedException() {
        super("Category is already archived");
    }
}
