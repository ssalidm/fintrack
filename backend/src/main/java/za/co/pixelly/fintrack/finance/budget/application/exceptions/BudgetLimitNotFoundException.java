package za.co.pixelly.fintrack.finance.budget.application.exceptions;

public class BudgetLimitNotFoundException
    extends RuntimeException {

    public BudgetLimitNotFoundException() {
        super("Budget category limit not found");
    }
}
