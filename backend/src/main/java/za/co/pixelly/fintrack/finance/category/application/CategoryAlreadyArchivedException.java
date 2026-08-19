package za.co.pixelly.fintrack.finance.category.application;

public class CategoryAlreadyArchivedException
    extends RuntimeException {

    public CategoryAlreadyArchivedException() {
        super("Category is already archived");
    }
}
