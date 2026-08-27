package za.co.pixelly.fintrack.finance.goal.persistence;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import za.co.pixelly.fintrack.finance.goal.domain.SavingsGoal;
import za.co.pixelly.fintrack.finance.goal.domain.SavingsGoalStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SavingsGoalRepository
    extends JpaRepository<SavingsGoal, UUID> {

    Optional<SavingsGoal> findByIdAndUserId(
        UUID id,
        UUID userId
    );


    List<SavingsGoal> findAllByUserIdAndStatusOrderByTargetDateAscCreatedAtDesc(
        UUID userId,
        SavingsGoalStatus status
    );


    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT goal
        FROM SavingsGoal goal
        WHERE goal.id = :goalId
          AND goal.userId = :userId
        """)
    Optional<SavingsGoal>
    findByIdAndUserIdForUpdate(
        @Param("goalId")
        UUID goalId,

        @Param("userId")
        UUID userId
    );


    @Query(
        value = """
            SELECT EXISTS (
                SELECT 1
                FROM finance.savings_goals g
                WHERE g.user_id = :userId
                  AND lower(btrim(g.name))
                      = lower(btrim(:name))
                  AND g.status IN (
                      'ACTIVE',
                      'COMPLETED'
                  )
            )
            """,
        nativeQuery = true
    )
    boolean existsOpenGoalWithName(
        @Param("userId")
        UUID userId,

        @Param("name")
        String name
    );


    @Query(
        value = """
            SELECT EXISTS (
                SELECT 1
                FROM finance.savings_goals g
                WHERE g.user_id = :userId
                  AND g.id <> :goalId
                  AND lower(btrim(g.name))
                      = lower(btrim(:name))
                  AND g.status IN (
                      'ACTIVE',
                      'COMPLETED'
                  )
            )
            """,
        nativeQuery = true
    )
    boolean existsOpenGoalWithNameExcluding(
        @Param("userId")
        UUID userId,

        @Param("name")
        String name,

        @Param("goalId")
        UUID goalId
    );
}
