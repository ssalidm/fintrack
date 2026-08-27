package za.co.pixelly.fintrack.finance.recurring.application;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import za.co.pixelly.fintrack.finance.recurring.domain.RecurringTransactionStatus;
import za.co.pixelly.fintrack.finance.recurring.persistence.RecurringTransactionRepository;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class RecurringTransactionScheduler {

    private final RecurringTransactionRepository recurringTransactionRepository;
    private final RecurringTransactionOccurrenceService occurrenceService;
    private final Clock recurringClock;

    @Value("${fintrack.recurring.schedule-batch-size:100}")
    private int scheduleBatchSize;

    @Value("${fintrack.recurring.max-catch-up-per-schedule:100}")
    private int maxCatchUpPerSchedule;


    @Scheduled(
        cron = "${fintrack.recurring.processing-cron:0 0 * * * *}",
        zone = "${fintrack.recurring.zone:Africa/Johannesburg}"
    )
    public void processDueSchedules() {

        LocalDate today = LocalDate.now(
            recurringClock
        );

        List<UUID> dueScheduleIds = recurringTransactionRepository
            .findDueAutomaticScheduleIds(
                RecurringTransactionStatus.ACTIVE,
                today,
                PageRequest.of(
                    0,
                    scheduleBatchSize
                )
            );

        for (UUID scheduleId
            : dueScheduleIds) {

            try {
                int generated = occurrenceService
                    .processAutomaticSchedule(
                        scheduleId,
                        today,
                        maxCatchUpPerSchedule
                    );

                if (generated > 0) {
                    log.info(
                        "Generated {} recurring transaction occurrence(s) for schedule {}",
                        generated,
                        scheduleId
                    );
                }

            } catch (RuntimeException exception) {

                /*
                 * One broken schedule must not stop
                 * every other user's due schedules.
                 */
                log.error(
                    "Failed to process recurring transaction schedule {}",
                    scheduleId,
                    exception
                );
            }
        }
    }
}
