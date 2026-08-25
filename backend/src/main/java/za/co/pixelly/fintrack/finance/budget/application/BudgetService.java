package za.co.pixelly.fintrack.finance.budget.application;

import za.co.pixelly.fintrack.finance.budget.api.*;
import za.co.pixelly.fintrack.finance.budget.domain.BudgetStatus;

import java.util.List;
import java.util.UUID;

public interface BudgetService {

    BudgetResponse create(
        UUID userId,
        CreateBudgetRequest request
    );

    List<BudgetSummaryResponse> findBudgets(
        UUID userId,
        BudgetStatus status
    );

    BudgetResponse findById(
        UUID userId,
        UUID budgetId
    );

    BudgetResponse update(
        UUID userId,
        UUID budgetId,
        UpdateBudgetRequest request
    );

    BudgetResponse archive(
        UUID userId,
        UUID budgetId,
        ArchiveBudgetRequest request
    );

    BudgetResponse addLimit(
        UUID userId,
        UUID budgetId,
        CreateBudgetLimitRequest request
    );

    BudgetResponse updateLimit(
        UUID userId,
        UUID budgetId,
        UUID limitId,
        UpdateBudgetLimitRequest request
    );

    void deleteLimit(
        UUID userId,
        UUID budgetId,
        UUID limitId,
        long version
    );
}
