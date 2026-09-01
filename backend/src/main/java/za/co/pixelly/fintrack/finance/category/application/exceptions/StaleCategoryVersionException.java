package za.co.pixelly.fintrack.finance.category.application.exceptions;

public class StaleCategoryVersionException
    extends RuntimeException {

    public StaleCategoryVersionException() {
        super(
            "The category has changed since it was last retrieved"
        );
    }
}
