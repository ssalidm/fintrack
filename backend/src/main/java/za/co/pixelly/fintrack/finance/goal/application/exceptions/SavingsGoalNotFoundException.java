package za.co.pixelly.fintrack.finance.goal.application.exceptions;

public class SavingsGoalNotFoundException
    extends RuntimeException {

    public SavingsGoalNotFoundException() {
        super("Savings goal not found");
    }
}
