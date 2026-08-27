package za.co.pixelly.fintrack.finance.goal.persistence;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import za.co.pixelly.fintrack.finance.goal.domain.GoalContribution;
import za.co.pixelly.fintrack.finance.goal.domain.GoalContributionStatus;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GoalContributionRepository
    extends JpaRepository<GoalContribution, UUID>,
    JpaSpecificationExecutor<GoalContribution> {

    Optional<GoalContribution> findByIdAndGoalIdAndUserId(
        UUID id,
        UUID goalId,
        UUID userId
    );


    @Query("""
            select coalesce(sum(c.amount), 0)
            from GoalContribution c
            where c.goalId = :goalId
              and c.userId = :userId
              and c.status = :status
            """)
    BigDecimal sumAmount(
        @Param("goalId")
        UUID goalId,

        @Param("userId")
        UUID userId,

        @Param("status")
        GoalContributionStatus status
    );


    @Query("""
        SELECT
            c.goalId AS goalId,
            sum(c.amount) AS currentAmount
        FROM GoalContribution c
        WHERE c.userId = :userId
          AND c.goalId IN :goalIds
          AND c.status = :status
        GROUP BY c.goalId
        """)
    List<GoalContributionTotal>
    sumAmountsByGoalIds(
        @Param("userId")
        UUID userId,

        @Param("goalIds")
        Collection<UUID> goalIds,

        @Param("status")
        GoalContributionStatus status
    );
}
