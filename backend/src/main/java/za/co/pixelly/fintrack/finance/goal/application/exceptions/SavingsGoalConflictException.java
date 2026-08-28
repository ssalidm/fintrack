package za.co.pixelly.fintrack.finance.goal.application.exceptions;

public class SavingsGoalConflictException
    extends RuntimeException {

    public SavingsGoalConflictException(
        String message
    ) {
        super(message);
    }
}
