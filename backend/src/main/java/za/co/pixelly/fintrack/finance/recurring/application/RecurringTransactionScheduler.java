package za.co.pixelly.fintrack.finance.recurring.application;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import za.co.pixelly.fintrack.finance.recurring.domain.RecurringTransactionStatus;
import za.co.pixelly.fintrack.finance.recurring.persistence.RecurringTransactionRepository;

import java.util.List;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class RecurringTransactionScheduler {

    private final RecurringTransactionRepository recurringTransactionRepository;
    private final RecurringTransactionOccurrenceService occurrenceService;

    @Value("${fintrack.recurring.schedule-batch-size:100}")
    private int scheduleBatchSize;

    @Value("${fintrack.recurring.max-catch-up-per-schedule:100}")
    private int maxCatchUpPerSchedule;


    @Scheduled(
        cron = "${fintrack.recurring.processing-cron:0 0 * * * *}",
        zone = "UTC"
    )
    public void processDueSchedules() {

        List<UUID> dueScheduleIds =
            recurringTransactionRepository
                .findDueAutomaticScheduleIds(
                    RecurringTransactionStatus.ACTIVE.name(),
                    PageRequest.of(
                        0,
                        scheduleBatchSize
                    )
                );

        for (UUID scheduleId : dueScheduleIds) {

            try {
                int generated =
                    occurrenceService
                        .processAutomaticSchedule(
                            scheduleId,
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

                log.error(
                    "Failed to process recurring transaction schedule {}",
                    scheduleId,
                    exception
                );
            }
        }
    }
}
