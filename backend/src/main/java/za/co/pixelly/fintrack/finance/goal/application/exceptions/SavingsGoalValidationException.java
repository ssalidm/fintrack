package za.co.pixelly.fintrack.finance.goal.application.exceptions;

public class SavingsGoalValidationException
    extends RuntimeException {

    public SavingsGoalValidationException(
        String message
    ) {
        super(message);
    }
}
