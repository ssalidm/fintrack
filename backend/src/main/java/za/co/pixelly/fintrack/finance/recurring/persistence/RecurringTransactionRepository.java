package za.co.pixelly.fintrack.finance.recurring.persistence;

import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import za.co.pixelly.fintrack.finance.recurring.domain.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RecurringTransactionRepository
    extends JpaRepository<RecurringTransaction, UUID> {

    Optional<RecurringTransaction>
    findByIdAndUserId(
        UUID id,
        UUID userId
    );


    List<RecurringTransaction>
    findAllByUserIdAndStatusOrderByNextDueDateAscCreatedAtDesc(
        UUID userId,
        RecurringTransactionStatus status
    );


    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        select schedule
        from RecurringTransaction schedule
        where schedule.id = :scheduleId
          and schedule.userId = :userId
        """)
    Optional<RecurringTransaction>
    findByIdAndUserIdForUpdate(
        @Param("scheduleId")
        UUID scheduleId,

        @Param("userId")
        UUID userId
    );


    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        select schedule
        from RecurringTransaction schedule
        where schedule.id = :scheduleId
        """)
    Optional<RecurringTransaction>
    findByIdForUpdate(
        @Param("scheduleId")
        UUID scheduleId
    );


    @Query(
        value = """
            SELECT EXISTS (
                SELECT 1
                FROM finance.recurring_transactions r
                WHERE r.user_id = :userId
                  AND lower(btrim(r.name))
                      = lower(btrim(:name))
                  AND r.status IN (
                      'ACTIVE',
                      'PAUSED'
                  )
            )
            """,
        nativeQuery = true
    )
    boolean existsOpenScheduleWithName(
        @Param("userId")
        UUID userId,

        @Param("name")
        String name
    );


    @Query(
        value = """
            SELECT EXISTS (
                SELECT 1
                FROM finance.recurring_transactions r
                WHERE r.user_id = :userId
                  AND r.id <> :scheduleId
                  AND lower(btrim(r.name))
                      = lower(btrim(:name))
                  AND r.status IN (
                      'ACTIVE',
                      'PAUSED'
                  )
            )
            """,
        nativeQuery = true
    )
    boolean existsOpenScheduleWithNameExcluding(
        @Param("userId")
        UUID userId,

        @Param("name")
        String name,

        @Param("scheduleId")
        UUID scheduleId
    );


    @Query(
        value = """
            SELECT r.id
            FROM finance.recurring_transactions r
            JOIN identity.users u
              ON u.id = r.user_id
            WHERE r.status = :status
              AND r.auto_post = true
              AND r.next_due_date IS NOT NULL
              AND r.next_due_date <= (
                  CURRENT_TIMESTAMP AT TIME ZONE u.time_zone
              )::date
            ORDER BY
                r.next_due_date ASC,
                r.created_at ASC
            """,
        nativeQuery = true
    )
    List<UUID> findDueAutomaticScheduleIds(
        @Param("status")
        String status,

        Pageable pageable
    );
}
