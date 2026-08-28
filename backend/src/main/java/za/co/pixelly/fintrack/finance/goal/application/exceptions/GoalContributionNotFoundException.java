package za.co.pixelly.fintrack.finance.goal.application.exceptions;

public class GoalContributionNotFoundException
    extends RuntimeException {

    public GoalContributionNotFoundException() {
        super("Goal contribution not found");
    }
}
