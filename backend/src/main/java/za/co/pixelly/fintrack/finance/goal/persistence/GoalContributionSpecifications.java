package za.co.pixelly.fintrack.finance.goal.persistence;

import org.springframework.data.jpa.domain.Specification;
import za.co.pixelly.fintrack.finance.goal.api.GoalContributionQuery;
import za.co.pixelly.fintrack.finance.goal.domain.GoalContribution;

import java.time.LocalDate;
import java.util.UUID;

public final class GoalContributionSpecifications {

    private GoalContributionSpecifications() {
    }


    public static Specification<GoalContribution> from(
        UUID userId,
        UUID goalId,
        GoalContributionQuery filters
    ) {
        Specification<GoalContribution> specification =
            ownedByGoal(
                userId,
                goalId
            );

        if (filters.getStatus() != null) {
            specification =
                specification.and(
                    (root, query, cb) ->
                        cb.equal(
                            root.get("status"),
                            filters.getStatus()
                        )
                );
        }

        if (filters.getFromDate() != null) {
            specification =
                specification.and(
                    onOrAfter(
                        filters.getFromDate()
                    )
                );
        }

        if (filters.getToDate() != null) {
            specification =
                specification.and(
                    onOrBefore(
                        filters.getToDate()
                    )
                );
        }

        return specification;
    }


    private static Specification<GoalContribution>
    ownedByGoal(
        UUID userId,
        UUID goalId
    ) {
        return (root, query, cb) ->
            cb.and(
                cb.equal(
                    root.get("userId"),
                    userId
                ),
                cb.equal(
                    root.get("goalId"),
                    goalId
                )
            );
    }


    private static Specification<GoalContribution>
    onOrAfter(LocalDate date) {

        return (root, query, cb) ->
            cb.greaterThanOrEqualTo(
                root.get("contributionDate"),
                date
            );
    }


    private static Specification<GoalContribution>
    onOrBefore(LocalDate date) {

        return (root, query, cb) ->
            cb.lessThanOrEqualTo(
                root.get("contributionDate"),
                date
            );
    }
}
