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


    @Query("""
            select schedule.id
            from RecurringTransaction schedule
            where schedule.status = :status
              and schedule.autoPost = true
              and schedule.nextDueDate <= :today
            order by schedule.nextDueDate asc,
                     schedule.createdAt asc
            """)
    List<UUID> findDueAutomaticScheduleIds(
        @Param("status")
        RecurringTransactionStatus status,

        @Param("today")
        LocalDate today,

        Pageable pageable
    );
}
