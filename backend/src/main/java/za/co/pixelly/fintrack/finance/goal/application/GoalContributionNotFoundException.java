package za.co.pixelly.fintrack.finance.goal.application;

public class GoalContributionNotFoundException
    extends RuntimeException {

    public GoalContributionNotFoundException() {
        super("Goal contribution not found");
    }
}
