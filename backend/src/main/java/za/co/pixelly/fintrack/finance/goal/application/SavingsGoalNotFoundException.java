package za.co.pixelly.fintrack.finance.goal.application;

public class SavingsGoalNotFoundException
    extends RuntimeException {

    public SavingsGoalNotFoundException() {
        super("Savings goal not found");
    }
}
