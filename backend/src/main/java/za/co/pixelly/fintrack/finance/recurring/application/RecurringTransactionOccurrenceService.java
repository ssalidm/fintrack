package za.co.pixelly.fintrack.finance.recurring.application;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import za.co.pixelly.fintrack.finance.account.domain.Account;
import za.co.pixelly.fintrack.finance.account.domain.AccountStatus;
import za.co.pixelly.fintrack.finance.account.persistence.AccountRepository;
import za.co.pixelly.fintrack.finance.category.domain.Category;
import za.co.pixelly.fintrack.finance.category.domain.CategoryStatus;
import za.co.pixelly.fintrack.finance.category.persistence.CategoryRepository;
import za.co.pixelly.fintrack.finance.recurring.api.*;
import za.co.pixelly.fintrack.finance.recurring.application.exceptions.RecurringTransactionConflictException;
import za.co.pixelly.fintrack.finance.recurring.application.exceptions.RecurringTransactionNotFoundException;
import za.co.pixelly.fintrack.finance.recurring.domain.*;
import za.co.pixelly.fintrack.finance.recurring.persistence.RecurringTransactionRepository;
import za.co.pixelly.fintrack.finance.transaction.api.TransactionResponse;
import za.co.pixelly.fintrack.finance.transaction.domain.Transaction;
import za.co.pixelly.fintrack.finance.transaction.persistence.TransactionRepository;
import za.co.pixelly.fintrack.identity.application.UserTimeService;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RecurringTransactionOccurrenceService {

    private final RecurringTransactionRepository recurringTransactionRepository;
    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final RecurrenceDateCalculator recurrenceDateCalculator;
    private final UserTimeService userTimeService;

    private final Clock applicationClock;


    @Transactional
    public RecurringTransactionOccurrenceResponse
    postDueManually(
        UUID userId,
        UUID scheduleId,
        long requestedVersion
    ) {
        RecurringTransaction schedule =
            recurringTransactionRepository
                .findByIdAndUserIdForUpdate(
                    scheduleId,
                    userId
                )
                .orElseThrow(
                    RecurringTransactionNotFoundException::new
                );

        if (schedule.getVersion()
            != requestedVersion) {

            throw new RecurringTransactionConflictException(
                "The recurring transaction has changed since it was last retrieved"
            );
        }

        if (schedule.getStatus()
            != RecurringTransactionStatus.ACTIVE) {

            throw new RecurringTransactionConflictException(
                "Only active recurring transactions can be posted"
            );
        }

        if (schedule.isAutoPost()) {

            throw new RecurringTransactionConflictException(
                "This recurring transaction is managed by automatic posting"
            );
        }

        LocalDate today = userTimeService.today(userId);

        if (schedule.getNextDueDate() == null
            || schedule
            .getNextDueDate()
            .isAfter(today)) {

            throw new RecurringTransactionConflictException(
                "Recurring transaction is not due yet"
            );
        }

        requireActiveReferences(
            schedule
        );

        Transaction transaction = generateOneOccurrence(
            schedule
        );

        recurringTransactionRepository
            .saveAndFlush(schedule);

        return new RecurringTransactionOccurrenceResponse(
            RecurringTransactionResponse.from(
                schedule
            ),
            TransactionResponse.from(
                transaction
            )
        );
    }


    @Transactional
    public int processAutomaticSchedule(
        UUID scheduleId,
        int maxOccurrences
    ) {
        RecurringTransaction schedule = recurringTransactionRepository
            .findByIdForUpdate(scheduleId)
            .orElse(null);

        if (schedule == null
            || schedule.getStatus()
            != RecurringTransactionStatus.ACTIVE
            || !schedule.isAutoPost()
            || schedule.getNextDueDate() == null) {

            return 0;
        }

        LocalDate today = userTimeService.today(schedule.getUserId());

        if (schedule.getNextDueDate().isAfter(today)) {
            return 0;
        }

        if (!referencesAreActive(schedule)) {

            schedule.pause(applicationClock.instant());

            recurringTransactionRepository
                .saveAndFlush(schedule);

            return 0;
        }

        int generated = 0;

        while (
            generated < maxOccurrences
                && schedule.getStatus()
                == RecurringTransactionStatus.ACTIVE
                && schedule.getNextDueDate()
                != null
                && !schedule
                .getNextDueDate()
                .isAfter(today)
        ) {
            generateOneOccurrence(schedule);
            generated++;
        }

        recurringTransactionRepository
            .saveAndFlush(schedule);

        return generated;
    }


    private Transaction generateOneOccurrence(
        RecurringTransaction schedule
    ) {
        LocalDate dueDate = schedule.getNextDueDate();

        Instant now = applicationClock.instant();

        Transaction transaction = Transaction.createTransaction(
            schedule.getUserId(),
            schedule.getAccountId(),
            schedule.getCategoryId(),
            schedule.getId(),
            dueDate,
            schedule.getTransactionType().toTransactionType(),
            schedule.getAmount(),
            dueDate,
            schedule.getDescription(),
            schedule.getMerchantName(),
            now
        );

        Transaction saved = transactionRepository.save(transaction);

        LocalDate calculatedNext =
            recurrenceDateCalculator.next(
                schedule.getStartDate(),
                dueDate,
                schedule.getFrequency(),
                schedule.getIntervalCount()
            );

        LocalDate nextDueDate = schedule.getEndDate() != null
            && calculatedNext.isAfter(schedule.getEndDate())
            ? null
            : calculatedNext;

        schedule.markGenerated(
            dueDate,
            nextDueDate,
            now
        );

        return saved;
    }


    private void requireActiveReferences(
        RecurringTransaction schedule
    ) {
        if (!referencesAreActive(
            schedule
        )) {

            throw new RecurringTransactionConflictException(
                "The recurring transaction requires an active account and category before it can be posted"
            );
        }
    }


    private boolean referencesAreActive(
        RecurringTransaction schedule
    ) {
        Account account = accountRepository
            .findByIdAndUserId(
                schedule.getAccountId(),
                schedule.getUserId()
            )
            .orElse(null);

        Category category = categoryRepository
            .findByIdAndUserId(
                schedule.getCategoryId(),
                schedule.getUserId()
            )
            .orElse(null);

        if (account == null || category == null) {
            return false;
        }

        return account.getStatus()
            == AccountStatus.ACTIVE
            && category.getStatus()
            == CategoryStatus.ACTIVE
            && category
            .getCategoryType()
            .name()
            .equals(
                schedule
                    .getTransactionType()
                    .name()
            );
    }
}
