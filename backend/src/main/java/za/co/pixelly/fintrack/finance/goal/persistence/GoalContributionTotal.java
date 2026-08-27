package za.co.pixelly.fintrack.finance.goal.persistence;

import java.math.BigDecimal;
import java.util.UUID;

public interface GoalContributionTotal {

    UUID getGoalId();

    BigDecimal getCurrentAmount();
}
