package za.co.pixelly.fintrack.finance.budget.application;

public class BudgetValidationException
    extends RuntimeException {

    public BudgetValidationException(String message) {
        super(message);
    }
}
