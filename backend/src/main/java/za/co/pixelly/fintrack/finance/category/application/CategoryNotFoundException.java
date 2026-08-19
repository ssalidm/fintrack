package za.co.pixelly.fintrack.finance.category.application;

public class CategoryNotFoundException
    extends RuntimeException {

    public CategoryNotFoundException() {
        super("Category not found");
    }
}
