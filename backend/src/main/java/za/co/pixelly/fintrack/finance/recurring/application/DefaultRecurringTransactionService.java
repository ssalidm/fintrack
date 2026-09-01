package za.co.pixelly.fintrack.finance.recurring.application;

import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import za.co.pixelly.fintrack.finance.account.application.exceptions.AccountNotFoundException;
import za.co.pixelly.fintrack.finance.account.domain.Account;
import za.co.pixelly.fintrack.finance.account.domain.AccountStatus;
import za.co.pixelly.fintrack.finance.account.persistence.AccountRepository;
import za.co.pixelly.fintrack.finance.category.application.exceptions.CategoryNotFoundException;
import za.co.pixelly.fintrack.finance.category.domain.Category;
import za.co.pixelly.fintrack.finance.category.domain.CategoryStatus;
import za.co.pixelly.fintrack.finance.category.persistence.CategoryRepository;
import za.co.pixelly.fintrack.finance.recurring.api.*;
import za.co.pixelly.fintrack.finance.recurring.application.exceptions.RecurringTransactionConflictException;
import za.co.pixelly.fintrack.finance.recurring.application.exceptions.RecurringTransactionNotFoundException;
import za.co.pixelly.fintrack.finance.recurring.application.exceptions.RecurringTransactionValidationException;
import za.co.pixelly.fintrack.finance.recurring.domain.*;
import za.co.pixelly.fintrack.finance.recurring.persistence.RecurringTransactionRepository;
import za.co.pixelly.fintrack.identity.application.UserTimeService;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DefaultRecurringTransactionService
    implements RecurringTransactionService {

    private final RecurringTransactionRepository recurringTransactionRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final RecurringTransactionOccurrenceService occurrenceService;
    private final RecurrenceDateCalculator recurrenceDateCalculator;
    private final Clock applicationClock;
    private final UserTimeService userTimeService;


    @Override
    @Transactional
    public RecurringTransactionResponse create(
        UUID userId,
        CreateRecurringTransactionRequest request
    ) {
        Account account = findOwnedAccount(
            userId,
            request.accountId()
        );

        Category category = findOwnedCategory(
            userId,
            request.categoryId()
        );

        requireActiveAccount(account);
        requireActiveCategory(category);

        validateCategoryType(
            category,
            request.transactionType()
        );

        if (recurringTransactionRepository
            .existsOpenScheduleWithName(
                userId,
                request.name()
            )) {

            throw new RecurringTransactionConflictException(
                "An active or paused recurring transaction already exists with this name"
            );
        }

        LocalDate today = userTimeService.today(userId);

        LocalDate initialNextDueDate = switch (request.catchUpMode()) {
            case GENERATE_MISSED -> request.startDate();
            case START_FROM_CURRENT -> recurrenceDateCalculator
                .firstDueOnOrAfter(
                    request.startDate(),
                    today,
                    request.frequency(),
                    request.intervalCount()
                );
        };

        if (request.endDate() != null
            && initialNextDueDate.isAfter(request.endDate())) {
            throw new RecurringTransactionValidationException(
                "The recurring schedule has no remaining occurrences"
            );
        }

        RecurringTransaction schedule = RecurringTransaction
            .create(
                userId,
                account.getId(),
                category.getId(),
                request.name(),
                request.transactionType(),
                request.amount(),
                request.description(),
                request.merchantName(),
                request.frequency(),
                request.intervalCount(),
                request.startDate(),
                initialNextDueDate,
                request.endDate(),
                request.autoPost(),
                applicationClock.instant()
            );

        try {
            RecurringTransaction saved =
                recurringTransactionRepository
                    .saveAndFlush(schedule);

            return RecurringTransactionResponse.from(
                saved
            );

        } catch (
            DataIntegrityViolationException exception
        ) {
            throw new RecurringTransactionConflictException(
                "An active or paused recurring transaction already exists with this name"
            );
        }
    }


    @Override
    @Transactional(readOnly = true)
    public List<RecurringTransactionResponse> findAll(
        UUID userId,
        RecurringTransactionStatus status
    ) {
        return recurringTransactionRepository
            .findAllByUserIdAndStatusOrderByNextDueDateAscCreatedAtDesc(
                userId,
                status
            )
            .stream()
            .map(
                RecurringTransactionResponse::from
            )
            .toList();
    }


    @Override
    @Transactional(readOnly = true)
    public RecurringTransactionResponse findById(
        UUID userId,
        UUID scheduleId
    ) {
        return RecurringTransactionResponse.from(
            findOwnedSchedule(
                userId,
                scheduleId
            )
        );
    }


    @Override
    @Transactional
    public RecurringTransactionResponse update(
        UUID userId,
        UUID scheduleId,
        UpdateRecurringTransactionRequest request
    ) {
        RecurringTransaction schedule =
            findOwnedScheduleForUpdate(
                userId,
                scheduleId
            );

        ensureEditable(schedule);

        validateVersion(
            schedule,
            request.version()
        );


        UUID targetAccountId =
            request.accountId() == null
                ? schedule.getAccountId()
                : request.accountId();

        UUID targetCategoryId =
            request.categoryId() == null
                ? schedule.getCategoryId()
                : request.categoryId();

        RecurringTransactionType targetType =
            request.transactionType() == null
                ? schedule.getTransactionType()
                : request.transactionType();


        Account targetAccount =
            findOwnedAccount(
                userId,
                targetAccountId
            );

        Category targetCategory =
            findOwnedCategory(
                userId,
                targetCategoryId
            );


        /*
         * Mirrors the database trigger:
         *
         * existing archived references are tolerated
         * for ordinary edits on a paused/active
         * schedule, but selecting a NEW account or
         * category requires it to be ACTIVE.
         */
        if (request.accountId() != null
            && !request.accountId()
            .equals(schedule.getAccountId())) {

            requireActiveAccount(
                targetAccount
            );
        }

        if (request.categoryId() != null
            && !request.categoryId()
            .equals(schedule.getCategoryId())) {

            requireActiveCategory(
                targetCategory
            );
        }

        validateCategoryType(
            targetCategory,
            targetType
        );


        String targetName =
            request.name() == null
                ? schedule.getName()
                : request.name();

        if (!targetName.equals(
            schedule.getName()
        )
            && recurringTransactionRepository
            .existsOpenScheduleWithNameExcluding(
                userId,
                targetName,
                scheduleId
            )) {

            throw new RecurringTransactionConflictException(
                "An active or paused recurring transaction already exists with this name"
            );
        }


        LocalDate targetEndDate;

        if (Boolean.TRUE.equals(
            request.clearEndDate()
        )) {

            targetEndDate = null;

        } else if (request.endDate()
            != null) {

            targetEndDate =
                request.endDate();

        } else {

            targetEndDate =
                schedule.getEndDate();
        }


        if (targetEndDate != null
            && targetEndDate.isBefore(
            schedule.getStartDate()
        )) {

            throw new RecurringTransactionValidationException(
                "endDate must be on or after startDate"
            );
        }


        if (targetEndDate != null
            && schedule.getNextDueDate()
            != null
            && targetEndDate.isBefore(
            schedule.getNextDueDate()
        )) {

            throw new RecurringTransactionValidationException(
                "endDate cannot be before the next due date"
            );
        }


        String targetDescription =
            request.description() == null
                ? schedule.getDescription()
                : normalizeNullable(
                request.description()
            );

        String targetMerchant =
            request.merchantName() == null
                ? schedule.getMerchantName()
                : normalizeNullable(
                request.merchantName()
            );


        schedule.updateDefinition(
            targetAccountId,
            targetCategoryId,
            targetName,
            targetType,
            request.amount() == null
                ? schedule.getAmount()
                : request.amount(),
            targetDescription,
            targetMerchant,
            request.frequency() == null
                ? schedule.getFrequency()
                : request.frequency(),
            request.intervalCount() == null
                ? schedule.getIntervalCount()
                : request.intervalCount(),
            targetEndDate,
            request.autoPost() == null
                ? schedule.isAutoPost()
                : request.autoPost(),
            Instant.now()
        );


        try {
            RecurringTransaction saved =
                recurringTransactionRepository
                    .saveAndFlush(schedule);

            return RecurringTransactionResponse.from(
                saved
            );

        } catch (
            DataIntegrityViolationException exception
        ) {
            throw new RecurringTransactionConflictException(
                "An active or paused recurring transaction already exists with this name"
            );
        }
    }


    @Override
    @Transactional
    public RecurringTransactionResponse pause(
        UUID userId,
        UUID scheduleId,
        RecurringTransactionVersionRequest request
    ) {
        RecurringTransaction schedule =
            findOwnedScheduleForUpdate(
                userId,
                scheduleId
            );

        if (schedule.getStatus()
            != RecurringTransactionStatus.ACTIVE) {

            throw new RecurringTransactionConflictException(
                "Only active recurring transactions can be paused"
            );
        }

        validateVersion(
            schedule,
            request.version()
        );

        schedule.pause(
            Instant.now()
        );

        return RecurringTransactionResponse.from(
            recurringTransactionRepository
                .saveAndFlush(schedule)
        );
    }


    @Override
    @Transactional
    public RecurringTransactionResponse resume(
        UUID userId,
        UUID scheduleId,
        RecurringTransactionVersionRequest request
    ) {
        RecurringTransaction schedule =
            findOwnedScheduleForUpdate(
                userId,
                scheduleId
            );

        if (schedule.getStatus()
            != RecurringTransactionStatus.PAUSED) {

            throw new RecurringTransactionConflictException(
                "Only paused recurring transactions can be resumed"
            );
        }

        validateVersion(
            schedule,
            request.version()
        );

        Account account =
            findOwnedAccount(
                userId,
                schedule.getAccountId()
            );

        Category category =
            findOwnedCategory(
                userId,
                schedule.getCategoryId()
            );

        requireActiveAccount(account);
        requireActiveCategory(category);

        validateCategoryType(
            category,
            schedule.getTransactionType()
        );

        schedule.resume(
            Instant.now()
        );

        return RecurringTransactionResponse.from(
            recurringTransactionRepository
                .saveAndFlush(schedule)
        );
    }


    @Override
    @Transactional
    public RecurringTransactionResponse archive(
        UUID userId,
        UUID scheduleId,
        RecurringTransactionVersionRequest request
    ) {
        RecurringTransaction schedule =
            findOwnedScheduleForUpdate(
                userId,
                scheduleId
            );

        if (schedule.getStatus()
            == RecurringTransactionStatus.ARCHIVED) {

            throw new RecurringTransactionConflictException(
                "Recurring transaction is already archived"
            );
        }

        validateVersion(
            schedule,
            request.version()
        );

        schedule.archive(
            Instant.now()
        );

        return RecurringTransactionResponse.from(
            recurringTransactionRepository
                .saveAndFlush(schedule)
        );
    }


    @Override
    public RecurringTransactionOccurrenceResponse postDue(
        UUID userId,
        UUID scheduleId,
        RecurringTransactionVersionRequest request
    ) {
        return occurrenceService
            .postDueManually(
                userId,
                scheduleId,
                request.version()
            );
    }


    private RecurringTransaction findOwnedSchedule(
        UUID userId,
        UUID scheduleId
    ) {
        return recurringTransactionRepository
            .findByIdAndUserId(
                scheduleId,
                userId
            )
            .orElseThrow(
                RecurringTransactionNotFoundException::new
            );
    }


    private RecurringTransaction
    findOwnedScheduleForUpdate(
        UUID userId,
        UUID scheduleId
    ) {
        return recurringTransactionRepository
            .findByIdAndUserIdForUpdate(
                scheduleId,
                userId
            )
            .orElseThrow(
                RecurringTransactionNotFoundException::new
            );
    }


    private Account findOwnedAccount(
        UUID userId,
        UUID accountId
    ) {
        return accountRepository
            .findByIdAndUserId(
                accountId,
                userId
            )
            .orElseThrow(
                AccountNotFoundException::new
            );
    }


    private Category findOwnedCategory(
        UUID userId,
        UUID categoryId
    ) {
        return categoryRepository
            .findByIdAndUserId(
                categoryId,
                userId
            )
            .orElseThrow(
                CategoryNotFoundException::new
            );
    }


    private void requireActiveAccount(
        Account account
    ) {
        if (account.getStatus()
            != AccountStatus.ACTIVE) {

            throw new RecurringTransactionConflictException(
                "Active recurring transactions require an active account"
            );
        }
    }


    private void requireActiveCategory(
        Category category
    ) {
        if (category.getStatus()
            != CategoryStatus.ACTIVE) {

            throw new RecurringTransactionConflictException(
                "Active recurring transactions require an active category"
            );
        }
    }


    private void validateCategoryType(
        Category category,
        RecurringTransactionType type
    ) {
        if (!category
            .getCategoryType()
            .name()
            .equals(type.name())) {

            throw new RecurringTransactionValidationException(
                "Recurring transaction type "
                    + type
                    + " requires a "
                    + type
                    + " category"
            );
        }
    }


    private void ensureEditable(
        RecurringTransaction schedule
    ) {
        if (schedule.getStatus()
            == RecurringTransactionStatus.COMPLETED
            || schedule.getStatus()
            == RecurringTransactionStatus.ARCHIVED) {

            throw new RecurringTransactionConflictException(
                "Completed or archived recurring transactions cannot be modified"
            );
        }
    }


    private void validateVersion(
        RecurringTransaction schedule,
        long requestedVersion
    ) {
        if (schedule.getVersion()
            != requestedVersion) {

            throw new RecurringTransactionConflictException(
                "The recurring transaction has changed since it was last retrieved"
            );
        }
    }


    private String normalizeNullable(
        String value
    ) {
        String trimmed =
            value.trim();

        return trimmed.isEmpty()
            ? null
            : trimmed;
    }
}
