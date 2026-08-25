package za.co.pixelly.fintrack.finance.budget.application;

public class BudgetLimitNotFoundException
    extends RuntimeException {

    public BudgetLimitNotFoundException() {
        super("Budget category limit not found");
    }
}
