package za.co.pixelly.fintrack.reporting.application;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import za.co.pixelly.fintrack.identity.application.UserTimeService;
import za.co.pixelly.fintrack.reporting.api.*;
import za.co.pixelly.fintrack.reporting.persistence.BudgetPerformanceRow;
import za.co.pixelly.fintrack.reporting.persistence.ReportingReadRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DefaultReportingService implements ReportingService {

    private static final int DASHBOARD_DUE_LIMIT = 5;

    private final ReportingReadRepository reportingReadRepository;
    private final UserTimeService userTimeService;

    @Override
    @Transactional(readOnly = true)
    public List<AccountBalanceReportResponse> getAccountBalances(UUID userId) {
        return reportingReadRepository
            .findAccountBalances(userId);
    }


    @Override
    @Transactional(readOnly = true)
    public List<NetWorthReportResponse> getNetWorth(UUID userId) {
        return reportingReadRepository
            .findNetWorthByCurrency(userId);
    }


    @Override
    @Transactional(readOnly = true)
    public List<MonthlyCashFlowResponse> getMonthlyCashFlow(
        UUID userId,
        LocalDate fromMonth,
        LocalDate toMonth
    ) {

        validateRange(fromMonth, toMonth);

        return reportingReadRepository
            .findMonthlyCashFlow(
                userId,
                fromMonth,
                toMonth
            );
    }


    @Override
    @Transactional(readOnly = true)
    public List<MonthlyCategorySpendingResponse> getMonthlyCategorySpending(
        UUID userId,
        LocalDate fromMonth,
        LocalDate toMonth
    ) {

        validateRange(fromMonth, toMonth);

        return reportingReadRepository
            .findMonthlyCategorySpending(
                userId,
                fromMonth,
                toMonth
            );
    }

    @Override
    @Transactional(readOnly = true)
    public BudgetPerformanceResponse
    getBudgetPerformance(
        UUID userId,
        UUID budgetId
    ) {

        if (!reportingReadRepository
            .budgetExists(
                userId,
                budgetId
            )) {

            throw new ReportingResourceNotFoundException(
                "Budget not found"
            );
        }


        List<BudgetPerformanceRow> rows = reportingReadRepository
            .findBudgetPerformance(
                userId,
                budgetId
            );


        /*
         * Existing budget with no category limits.
         */
        if (rows.isEmpty()) {
            return new BudgetPerformanceResponse(
                budgetId,
                null,
                null,
                null,
                null,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                false,
                List.of()
            );
        }


        BudgetPerformanceRow first = rows.getFirst();


        List<BudgetCategoryPerformanceResponse>
            categories = rows.stream()
            .map(
                row ->
                    new BudgetCategoryPerformanceResponse(
                        row.budgetLimitId(),
                        row.categoryId(),
                        row.categoryName(),
                        row.limitAmount(),
                        row.spentAmount(),
                        row.remainingAmount(),
                        row.utilizationPercentage(),
                        row.exceeded()
                    )
            )
            .toList();


        BigDecimal totalLimit = rows.stream()
            .map(
                BudgetPerformanceRow::limitAmount
            )
            .reduce(
                BigDecimal.ZERO,
                BigDecimal::add
            );


        BigDecimal totalSpent = rows.stream()
            .map(
                BudgetPerformanceRow::spentAmount
            )
            .reduce(
                BigDecimal.ZERO,
                BigDecimal::add
            );


        BigDecimal totalRemaining = totalLimit.subtract(totalSpent);


        BigDecimal utilization = totalLimit.signum() == 0
            ? BigDecimal.ZERO
            : totalSpent
            .multiply(
                BigDecimal.valueOf(100)
            )
            .divide(
                totalLimit,
                2,
                RoundingMode.HALF_UP
            );


        boolean anyCategoryExceeded = rows.stream()
            .anyMatch(
                BudgetPerformanceRow::exceeded
            );


        return new BudgetPerformanceResponse(
            first.budgetId(),
            first.budgetName(),
            first.budgetMonth(),
            first.currencyCode(),
            first.budgetStatus(),
            totalLimit,
            totalSpent,
            totalRemaining,
            utilization,
            anyCategoryExceeded,
            categories
        );
    }

    @Override
    @Transactional(readOnly = true)
    public SavingsGoalProgressResponse
    getSavingsGoalProgress(
        UUID userId,
        UUID goalId
    ) {

        return reportingReadRepository
            .findSavingsGoalProgress(
                userId,
                goalId
            )
            .orElseThrow(
                () ->
                    new ReportingResourceNotFoundException(
                        "Savings goal not found"
                    )
            );
    }


    @Override
    @Transactional(readOnly = true)
    public List<RecurringTransactionDueResponse>
    getRecurringTransactionsDue(
        UUID userId,
        int limit
    ) {
        return reportingReadRepository
            .findRecurringTransactionsDue(
                userId,
                limit
            );
    }


    @Override
    @Transactional(readOnly = true)
    public DashboardSummaryResponse
    getDashboardSummary(
        UUID userId
    ) {

        LocalDate today = userTimeService.today(userId);

        LocalDate currentMonth = today.withDayOfMonth(1);


        List<AccountBalanceReportResponse>
            accountBalances = reportingReadRepository
            .findAccountBalances(
                userId
            );


        int totalAccountCount = accountBalances.size();


        int activeAccountCount = Math.toIntExact(
            accountBalances.stream()
                .filter(
                    account ->
                        "ACTIVE".equals(
                            account.status()
                        )
                )
                .count()
        );


        int archivedAccountCount = Math.toIntExact(
            accountBalances.stream()
                .filter(
                    account ->
                        "ARCHIVED".equals(
                            account.status()
                        )
                )
                .count()
        );


        List<NetWorthReportResponse>
            netWorth = reportingReadRepository
            .findNetWorthByCurrency(
                userId
            );


        List<MonthlyCashFlowResponse>
            currentMonthCashFlow = reportingReadRepository
            .findMonthlyCashFlow(
                userId,
                currentMonth,
                currentMonth
            );


        long dueRecurringCount = reportingReadRepository
            .countRecurringTransactionsDue(
                userId
            );


        List<RecurringTransactionDueResponse>
            dueRecurringTransactions = reportingReadRepository
            .findRecurringTransactionsDue(
                userId,
                DASHBOARD_DUE_LIMIT
            );


        return new DashboardSummaryResponse(
            today,
            totalAccountCount,
            activeAccountCount,
            archivedAccountCount,
            netWorth,
            currentMonthCashFlow,
            dueRecurringCount,
            dueRecurringTransactions
        );
    }


    private void validateRange(
        LocalDate fromMonth,
        LocalDate toMonth
    ) {

        if (fromMonth.isAfter(toMonth)) {
            throw new InvalidReportingRangeException(
                "fromMonth must not be after toMonth"
            );
        }

        if (fromMonth.getDayOfMonth() != 1
            || toMonth.getDayOfMonth() != 1) {
            throw new InvalidReportingRangeException(
                "Reporting month parameters must use the first day of the month"
            );
        }
    }
}
