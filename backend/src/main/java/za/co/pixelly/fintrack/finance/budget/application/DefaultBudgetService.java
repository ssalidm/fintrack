package za.co.pixelly.fintrack.finance.budget.application;

import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import za.co.pixelly.fintrack.finance.budget.api.*;
import za.co.pixelly.fintrack.finance.budget.application.exceptions.BudgetConflictException;
import za.co.pixelly.fintrack.finance.budget.application.exceptions.BudgetLimitNotFoundException;
import za.co.pixelly.fintrack.finance.budget.application.exceptions.BudgetNotFoundException;
import za.co.pixelly.fintrack.finance.budget.application.exceptions.BudgetValidationException;
import za.co.pixelly.fintrack.finance.budget.domain.Budget;
import za.co.pixelly.fintrack.finance.budget.domain.BudgetCategoryLimit;
import za.co.pixelly.fintrack.finance.budget.domain.BudgetStatus;
import za.co.pixelly.fintrack.finance.budget.persistence.BudgetCategoryLimitRepository;
import za.co.pixelly.fintrack.finance.budget.persistence.BudgetCurrencyLookupRepository;
import za.co.pixelly.fintrack.finance.budget.persistence.BudgetRepository;
import za.co.pixelly.fintrack.finance.category.application.exceptions.CategoryNotFoundException;
import za.co.pixelly.fintrack.finance.category.domain.Category;
import za.co.pixelly.fintrack.finance.category.domain.CategoryStatus;
import za.co.pixelly.fintrack.finance.category.domain.CategoryType;
import za.co.pixelly.fintrack.finance.category.persistence.CategoryRepository;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DefaultBudgetService implements BudgetService {

    private final BudgetRepository budgetRepository;
    private final BudgetCategoryLimitRepository budgetCategoryLimitRepository;
    private final BudgetCurrencyLookupRepository currencyLookupRepository;
    private final CategoryRepository categoryRepository;


    @Override
    @Transactional
    public BudgetResponse create(UUID userId, CreateBudgetRequest request
    ) {
        LocalDate budgetMonth = request.budgetMonth().withDayOfMonth(1);

        String currencyCode = request.currencyCode()
            .trim()
            .toUpperCase(Locale.ROOT);

        if (!currencyLookupRepository
            .exists(currencyCode)) {

            throw new BudgetValidationException(
                "Unsupported currency code"
            );
        }

        boolean duplicate = budgetRepository
            .existsByUserIdAndBudgetMonthAndCurrencyCodeAndStatus(
                userId,
                budgetMonth,
                currencyCode,
                BudgetStatus.ACTIVE
            );

        if (duplicate) {
            throw new BudgetConflictException(
                "An active budget already exists for this month and currency"
            );
        }

        Budget budget = Budget.create(
            userId,
            request.name(),
            budgetMonth,
            currencyCode,
            Instant.now()
        );

        try {
            Budget saved = budgetRepository.saveAndFlush(budget);

            return BudgetResponse.from(
                saved,
                List.of()
            );

        } catch (
            DataIntegrityViolationException exception
        ) {
            /*
             * Protect against a concurrent request
             * racing past the pre-check.
             */
            throw new BudgetConflictException(
                "An active budget already exists for this month and currency"
            );
        }
    }


    @Override
    @Transactional(readOnly = true)
    public List<BudgetSummaryResponse> findBudgets(UUID userId, BudgetStatus status) {
        return budgetRepository.findAllByUserIdAndStatusOrderByBudgetMonthDescCreatedAtDesc(
                userId,
                status
            )
            .stream()
            .map(BudgetSummaryResponse::from)
            .toList();
    }


    @Override
    @Transactional(readOnly = true)
    public BudgetResponse findById(UUID userId, UUID budgetId) {
        Budget budget = findOwnedBudget(userId, budgetId);

        return detailedResponse(
            budget
        );
    }


    @Override
    @Transactional
    public BudgetResponse update(
        UUID userId,
        UUID budgetId,
        UpdateBudgetRequest request
    ) {
        Budget budget = findOwnedBudget(userId, budgetId);

        ensureActive(budget);

        validateBudgetVersion(budget, request.version());

        budget.rename(request.name(), Instant.now());

        Budget saved = budgetRepository.saveAndFlush(budget);

        return detailedResponse(saved);
    }


    @Override
    @Transactional
    public BudgetResponse archive(
        UUID userId,
        UUID budgetId,
        ArchiveBudgetRequest request
    ) {
        Budget budget = findOwnedBudget(userId, budgetId);

        if (budget.getStatus() == BudgetStatus.ARCHIVED) {
            throw new BudgetConflictException("Budget is already archived");
        }

        validateBudgetVersion(budget, request.version());

        budget.archive(Instant.now());

        Budget saved = budgetRepository.saveAndFlush(budget);

        return detailedResponse(saved);
    }


    @Override
    @Transactional
    public BudgetResponse addLimit(
        UUID userId,
        UUID budgetId,
        CreateBudgetLimitRequest request
    ) {
        Budget budget = findOwnedBudget(userId, budgetId);

        ensureActive(budget);

        Category category = findActiveExpenseCategory(
            userId,
            request.categoryId()
        );

        if (budgetCategoryLimitRepository
            .existsByBudgetIdAndCategoryId(
                budgetId,
                category.getId()
            )) {

            throw new BudgetConflictException(
                "This category already has a limit in the budget"
            );
        }

        BudgetCategoryLimit limit = BudgetCategoryLimit.create(
            budgetId,
            userId,
            category.getId(),
            request.limitAmount(),
            Instant.now()
        );

        try {
            budgetCategoryLimitRepository.saveAndFlush(limit);

        } catch (
            DataIntegrityViolationException exception
        ) {
            throw new BudgetConflictException(
                "This category already has a limit in the budget"
            );
        }

        return detailedResponse(budget);
    }


    @Override
    @Transactional
    public BudgetResponse updateLimit(
        UUID userId,
        UUID budgetId,
        UUID limitId,
        UpdateBudgetLimitRequest request
    ) {
        Budget budget = findOwnedBudget(userId, budgetId);

        ensureActive(budget);

        BudgetCategoryLimit limit = budgetCategoryLimitRepository
            .findByIdAndBudgetIdAndUserId(
                limitId,
                budgetId,
                userId
            )
            .orElseThrow(BudgetLimitNotFoundException::new);

        validateLimitVersion(limit, request.version());


        /*
         * The trigger only requires category ACTIVE
         * when the category is newly assigned or
         * changed.
         *
         * Therefore, an amount-only update is still
         * legal if the existing category has since
         * been archived.
         */
        if (request.categoryId() != null
            && !request.categoryId()
            .equals(limit.getCategoryId())) {

            Category category = findActiveExpenseCategory(
                userId,
                request.categoryId()
            );

            boolean duplicate = budgetCategoryLimitRepository
                .existsByBudgetIdAndCategoryIdAndIdNot(
                    budgetId,
                    category.getId(),
                    limitId
                );

            if (duplicate) {
                throw new BudgetConflictException(
                    "This category already has a limit in the budget"
                );
            }
        }

        try {
            limit.update(
                request.categoryId(),
                request.limitAmount(),
                Instant.now()
            );

            budgetCategoryLimitRepository.saveAndFlush(limit);

        } catch (
            DataIntegrityViolationException exception
        ) {
            throw new BudgetConflictException(
                "This category already has a limit in the budget"
            );
        }

        return detailedResponse(budget);
    }


    @Override
    @Transactional
    public void deleteLimit(
        UUID userId,
        UUID budgetId,
        UUID limitId,
        long version
    ) {
        Budget budget = findOwnedBudget(
            userId,
            budgetId
        );

        ensureActive(budget);

        BudgetCategoryLimit limit = budgetCategoryLimitRepository
            .findByIdAndBudgetIdAndUserId(
                limitId,
                budgetId,
                userId
            )
            .orElseThrow(BudgetLimitNotFoundException::new);

        validateLimitVersion(limit, version);

        budgetCategoryLimitRepository.delete(limit);

        budgetCategoryLimitRepository.flush();
    }


    private Budget findOwnedBudget(
        UUID userId,
        UUID budgetId
    ) {
        return budgetRepository
            .findByIdAndUserId(budgetId, userId)
            .orElseThrow(BudgetNotFoundException::new);
    }


    private Category findActiveExpenseCategory(
        UUID userId,
        UUID categoryId
    ) {
        Category category = categoryRepository
            .findByIdAndUserId(categoryId, userId)
            .orElseThrow(CategoryNotFoundException::new);

        if (category.getCategoryType()
            != CategoryType.EXPENSE) {

            throw new BudgetValidationException(
                "Budgets may only be assigned to expense categories"
            );
        }

        if (category.getStatus()
            != CategoryStatus.ACTIVE) {

            throw new BudgetConflictException(
                "New budget limits cannot use archived categories"
            );
        }

        return category;
    }


    private void ensureActive(
        Budget budget
    ) {
        if (budget.getStatus() != BudgetStatus.ACTIVE) {
            throw new BudgetConflictException(
                "Archived budgets cannot be modified"
            );
        }
    }


    private void validateBudgetVersion(
        Budget budget,
        long requestedVersion
    ) {
        if (budget.getVersion() != requestedVersion) {
            throw new BudgetConflictException(
                "The budget has changed since it was last retrieved"
            );
        }
    }


    private void validateLimitVersion(
        BudgetCategoryLimit limit,
        long requestedVersion
    ) {
        if (limit.getVersion() != requestedVersion) {
            throw new BudgetConflictException(
                "The budget category limit has changed since it was last retrieved"
            );
        }
    }


    private BudgetResponse detailedResponse(
        Budget budget
    ) {
        List<BudgetCategoryLimit> limits = budgetCategoryLimitRepository
            .findAllByBudgetIdAndUserIdOrderByCreatedAtAsc(
                budget.getId(),
                budget.getUserId()
            );

        return BudgetResponse.from(
            budget,
            limits
        );
    }
}
