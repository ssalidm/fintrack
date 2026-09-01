package za.co.pixelly.fintrack.unit.finance.recurring.application;

import org.junit.jupiter.api.Test;
import za.co.pixelly.fintrack.finance.recurring.application.RecurrenceDateCalculator;
import za.co.pixelly.fintrack.finance.recurring.domain.RecurringFrequency;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class RecurrenceDateCalculatorTest {

    private final RecurrenceDateCalculator calculator = new RecurrenceDateCalculator();

    @Test
    void monthlySchedulePreservesOriginalDayOfMonth() {

        LocalDate start = LocalDate.of(2026, 1, 31);
        LocalDate february = calculator.next(start, start, RecurringFrequency.MONTHLY, 1);
        LocalDate march = calculator.next(start, february, RecurringFrequency.MONTHLY, 1);

        assertEquals(LocalDate.of(2026, 2, 28), february);
        assertEquals(LocalDate.of(2026, 3, 31), march);
    }

    @Test
    void yearlyLeapDayScheduleReturnsToLeapDay() {

        LocalDate start = LocalDate.of(2024, 2, 29);
        LocalDate year2025 = calculator.next(start, start, RecurringFrequency.YEARLY, 1);
        LocalDate year2026 = calculator.next(start, year2025, RecurringFrequency.YEARLY, 1);
        LocalDate year2027 = calculator.next(start, year2026, RecurringFrequency.YEARLY, 1);
        LocalDate year2028 = calculator.next(start, year2027, RecurringFrequency.YEARLY, 1);

        assertEquals(LocalDate.of(2025, 2, 28), year2025);
        assertEquals(LocalDate.of(2028, 2, 29), year2028);
    }

    @Test
    void intervalCountIsApplied() {
        LocalDate start = LocalDate.of(2026, 1, 15);

        assertEquals(LocalDate.of(2026, 4, 15),
            calculator.next(start, start, RecurringFrequency.MONTHLY, 3)
        );
    }

    @Test
    void firstDueOnOrAfterReturnsStartDateWhenStartIsInFuture() {

        LocalDate start = LocalDate.of(2026, 9, 1);
        LocalDate today = LocalDate.of(2026, 8, 27);

        assertEquals(
            start,
            calculator.firstDueOnOrAfter(
                start,
                today,
                RecurringFrequency.MONTHLY,
                1
            )
        );
    }

    @Test
    void firstDueOnOrAfterSkipsHistoricalDailyOccurrences() {

        LocalDate start = LocalDate.of(2026, 8, 20);
        LocalDate today = LocalDate.of(2026, 8, 27);
        assertEquals(LocalDate.of(2026, 8, 27),
            calculator.firstDueOnOrAfter(start, today, RecurringFrequency.DAILY, 1)
        );
    }

    @Test
    void firstDueOnOrAfterPreservesMonthlyAnchor() {

        LocalDate start = LocalDate.of(2026, 1, 31);
        LocalDate target = LocalDate.of(2026, 3, 1);
        assertEquals(LocalDate.of(2026, 3, 31),
            calculator.firstDueOnOrAfter(
                start,
                target,
                RecurringFrequency.MONTHLY,
                1
            )
        );
    }
}
