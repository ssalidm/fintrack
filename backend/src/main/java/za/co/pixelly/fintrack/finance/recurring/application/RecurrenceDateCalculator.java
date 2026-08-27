package za.co.pixelly.fintrack.finance.recurring.application;

import org.springframework.stereotype.Component;
import za.co.pixelly.fintrack.finance.recurring.domain.RecurringFrequency;

import java.time.LocalDate;
import java.time.YearMonth;

@Component
public class RecurrenceDateCalculator {

    public LocalDate next(
        LocalDate startDate,
        LocalDate currentDueDate,
        RecurringFrequency frequency,
        int intervalCount
    ) {
        return switch (frequency) {

            case DAILY -> currentDueDate.plusDays(
                intervalCount
            );

            case WEEKLY -> currentDueDate.plusWeeks(
                intervalCount
            );

            case MONTHLY -> nextMonthly(
                startDate,
                currentDueDate,
                intervalCount
            );

            case YEARLY -> nextYearly(
                startDate,
                currentDueDate,
                intervalCount
            );
        };
    }

    public LocalDate firstDueOnOrAfter(
        LocalDate startDate,
        LocalDate targetDate,
        RecurringFrequency frequency,
        int intervalCount
    ) {
        if (!startDate.isBefore(targetDate)) {
            return startDate;
        }

        LocalDate dueDate = startDate;

        while (dueDate.isBefore(targetDate)) {
            dueDate = next(
                startDate,
                dueDate,
                frequency,
                intervalCount
            );
        }
        return dueDate;
    }


    private LocalDate nextMonthly(
        LocalDate startDate,
        LocalDate currentDueDate,
        int intervalCount
    ) {
        YearMonth targetMonth = YearMonth
            .from(currentDueDate)
            .plusMonths(intervalCount);

        int targetDay = Math.min(
            startDate.getDayOfMonth(),
            targetMonth.lengthOfMonth()
        );

        return targetMonth.atDay(
            targetDay
        );
    }


    private LocalDate nextYearly(
        LocalDate startDate,
        LocalDate currentDueDate,
        int intervalCount
    ) {
        int targetYear = currentDueDate.getYear()
            + intervalCount;

        YearMonth targetMonth = YearMonth.of(
            targetYear,
            startDate.getMonth()
        );

        int targetDay = Math.min(
            startDate.getDayOfMonth(),
            targetMonth.lengthOfMonth()
        );

        return targetMonth.atDay(
            targetDay
        );
    }
}
