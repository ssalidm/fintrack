package za.co.pixelly.fintrack.finance.budget.application.exceptions;

public class BudgetValidationException
    extends RuntimeException {

    public BudgetValidationException(String message) {
        super(message);
    }
}
