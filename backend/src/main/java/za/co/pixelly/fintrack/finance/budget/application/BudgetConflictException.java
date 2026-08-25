package za.co.pixelly.fintrack.finance.budget.application;

public class BudgetConflictException
    extends RuntimeException {

    public BudgetConflictException(
        String message
    ) {
        super(message);
    }
}
