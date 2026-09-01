package za.co.pixelly.fintrack.finance.category.application.exceptions;

public class DuplicateCategoryNameException
    extends RuntimeException {

    public DuplicateCategoryNameException() {
        super(
            "An active category with this name and type already exists"
        );
    }
}
