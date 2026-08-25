package za.co.pixelly.fintrack.finance.budget.application;

public class BudgetNotFoundException
    extends RuntimeException {

    public BudgetNotFoundException() {
        super("Budget not found");
    }
}
