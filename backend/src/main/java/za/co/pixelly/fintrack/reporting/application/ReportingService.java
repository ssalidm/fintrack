package za.co.pixelly.fintrack.reporting.application;

import za.co.pixelly.fintrack.reporting.api.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface ReportingService {

    List<AccountBalanceReportResponse> getAccountBalances(
        UUID userId
    );

    List<NetWorthReportResponse> getNetWorth(
        UUID userId
    );

    List<MonthlyCashFlowResponse> getMonthlyCashFlow(
        UUID userId,
        LocalDate fromMonth,
        LocalDate toMonth
    );

    List<MonthlyCategorySpendingResponse> getMonthlyCategorySpending(
        UUID userId,
        LocalDate fromMonth,
        LocalDate toMonth
    );

    BudgetPerformanceResponse getBudgetPerformance(
        UUID userId,
        UUID budgetId
    );

    SavingsGoalProgressResponse getSavingsGoalProgress(
        UUID userId,
        UUID goalId
    );

    List<RecurringTransactionDueResponse> getRecurringTransactionsDue(
        UUID userId,
        int limit
    );

    DashboardSummaryResponse getDashboardSummary(
        UUID userId
    );
}
