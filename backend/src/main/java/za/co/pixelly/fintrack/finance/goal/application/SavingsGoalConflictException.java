package za.co.pixelly.fintrack.finance.goal.application;

public class SavingsGoalConflictException
    extends RuntimeException {

    public SavingsGoalConflictException(
        String message
    ) {
        super(message);
    }
}
