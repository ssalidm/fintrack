package za.co.pixelly.fintrack.reporting.application;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import za.co.pixelly.fintrack.identity.application.UserTimeService;
import za.co.pixelly.fintrack.reporting.api.AccountBalanceReportResponse;
import za.co.pixelly.fintrack.reporting.api.BudgetCategoryPerformanceResponse;
import za.co.pixelly.fintrack.reporting.api.BudgetPerformanceResponse;
import za.co.pixelly.fintrack.reporting.api.DashboardSummaryResponse;
import za.co.pixelly.fintrack.reporting.api.MonthlyCashFlowResponse;
import za.co.pixelly.fintrack.reporting.api.MonthlyCategorySpendingResponse;
import za.co.pixelly.fintrack.reporting.api.NetWorthReportResponse;
import za.co.pixelly.fintrack.reporting.api.RecurringTransactionDueResponse;
import za.co.pixelly.fintrack.reporting.api.SavingsGoalProgressResponse;
import za.co.pixelly.fintrack.reporting.persistence.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DefaultReportingService
    implements ReportingService {

    private static final int
        DASHBOARD_DUE_LIMIT = 5;

    private final ReportingReadRepository
        reportingReadRepository;

    private final UserTimeService
        userTimeService;


    @Override
    @Transactional(readOnly = true)
    public List<AccountBalanceReportResponse>
    getAccountBalances(
        UUID userId
    ) {
        return reportingReadRepository
            .findAccountBalances(
                userId
            )
            .stream()
            .map(
                DefaultReportingService
                    ::toResponse
            )
            .toList();
    }


    @Override
    @Transactional(readOnly = true)
    public List<NetWorthReportResponse>
    getNetWorth(
        UUID userId
    ) {
        return reportingReadRepository
            .findNetWorthByCurrency(
                userId
            )
            .stream()
            .map(
                DefaultReportingService
                    ::toResponse
            )
            .toList();
    }


    @Override
    @Transactional(readOnly = true)
    public List<MonthlyCashFlowResponse>
    getMonthlyCashFlow(
        UUID userId,
        LocalDate fromMonth,
        LocalDate toMonth
    ) {
        validateRange(
            fromMonth,
            toMonth
        );

        return reportingReadRepository
            .findMonthlyCashFlow(
                userId,
                fromMonth,
                toMonth
            )
            .stream()
            .map(
                DefaultReportingService
                    ::toResponse
            )
            .toList();
    }


    @Override
    @Transactional(readOnly = true)
    public List<MonthlyCategorySpendingResponse>
    getMonthlyCategorySpending(
        UUID userId,
        LocalDate fromMonth,
        LocalDate toMonth
    ) {
        validateRange(
            fromMonth,
            toMonth
        );

        return reportingReadRepository
            .findMonthlyCategorySpending(
                userId,
                fromMonth,
                toMonth
            )
            .stream()
            .map(
                DefaultReportingService
                    ::toResponse
            )
            .toList();
    }


    @Override
    @Transactional(readOnly = true)
    public BudgetPerformanceResponse
    getBudgetPerformance(
        UUID userId,
        UUID budgetId
    ) {
        if (
            !reportingReadRepository
                .budgetExists(
                    userId,
                    budgetId
                )
        ) {
            throw new ReportingResourceNotFoundException(
                "Budget not found"
            );
        }

        List<BudgetPerformanceRow> rows =
            reportingReadRepository
                .findBudgetPerformance(
                    userId,
                    budgetId
                );

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

        BudgetPerformanceRow first =
            rows.getFirst();

        List<BudgetCategoryPerformanceResponse>
            categories =
            rows.stream()
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

        BigDecimal totalLimit =
            rows.stream()
                .map(
                    BudgetPerformanceRow
                        ::limitAmount
                )
                .reduce(
                    BigDecimal.ZERO,
                    BigDecimal::add
                );

        BigDecimal totalSpent =
            rows.stream()
                .map(
                    BudgetPerformanceRow
                        ::spentAmount
                )
                .reduce(
                    BigDecimal.ZERO,
                    BigDecimal::add
                );

        BigDecimal totalRemaining =
            totalLimit.subtract(
                totalSpent
            );

        BigDecimal utilization =
            totalLimit.signum() == 0
                ? BigDecimal.ZERO
                : totalSpent
                .multiply(
                    BigDecimal.valueOf(
                        100
                    )
                )
                .divide(
                    totalLimit,
                    2,
                    RoundingMode.HALF_UP
                );

        boolean anyCategoryExceeded =
            rows.stream()
                .anyMatch(
                    BudgetPerformanceRow
                        ::exceeded
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
            .map(
                DefaultReportingService
                    ::toResponse
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
            )
            .stream()
            .map(
                DefaultReportingService
                    ::toResponse
            )
            .toList();
    }


    @Override
    @Transactional(readOnly = true)
    public DashboardSummaryResponse
    getDashboardSummary(
        UUID userId
    ) {
        LocalDate today =
            userTimeService.today(
                userId
            );

        LocalDate currentMonth =
            today.withDayOfMonth(
                1
            );

        List<AccountBalanceRow>
            accountBalances =
            reportingReadRepository
                .findAccountBalances(
                    userId
                );

        int totalAccountCount =
            accountBalances.size();

        int activeAccountCount =
            Math.toIntExact(
                accountBalances
                    .stream()
                    .filter(
                        account ->
                            "ACTIVE".equals(
                                account.status()
                            )
                    )
                    .count()
            );

        int archivedAccountCount =
            Math.toIntExact(
                accountBalances
                    .stream()
                    .filter(
                        account ->
                            "ARCHIVED".equals(
                                account.status()
                            )
                    )
                    .count()
            );

        List<NetWorthReportResponse>
            netWorth =
            reportingReadRepository
                .findNetWorthByCurrency(
                    userId
                )
                .stream()
                .map(
                    DefaultReportingService
                        ::toResponse
                )
                .toList();

        List<MonthlyCashFlowResponse>
            currentMonthCashFlow =
            reportingReadRepository
                .findMonthlyCashFlow(
                    userId,
                    currentMonth,
                    currentMonth
                )
                .stream()
                .map(
                    DefaultReportingService
                        ::toResponse
                )
                .toList();

        long dueRecurringCount =
            reportingReadRepository
                .countRecurringTransactionsDue(
                    userId
                );

        List<RecurringTransactionDueResponse>
            dueRecurringTransactions =
            reportingReadRepository
                .findRecurringTransactionsDue(
                    userId,
                    DASHBOARD_DUE_LIMIT
                )
                .stream()
                .map(
                    DefaultReportingService
                        ::toResponse
                )
                .toList();

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
        if (
            fromMonth.isAfter(
                toMonth
            )
        ) {
            throw new InvalidReportingRangeException(
                "fromMonth must not be after toMonth"
            );
        }

        if (fromMonth.getDayOfMonth()
            != 1
            || toMonth.getDayOfMonth()
                != 1
        ) {
            throw new InvalidReportingRangeException(
                "Reporting month parameters must use the first day of the month"
            );
        }
    }


    private static AccountBalanceReportResponse
    toResponse(
        AccountBalanceRow row
    ) {
        return new AccountBalanceReportResponse(
            row.accountId(),
            row.accountName(),
            row.accountType(),
            row.currencyCode(),
            row.openingBalance(),
            row.transactionTotal(),
            row.currentBalance(),
            row.postedTransactionCount(),
            row.includeInNetWorth(),
            row.status(),
            row.createdAt(),
            row.updatedAt()
        );
    }

    private static SavingsGoalProgressResponse
    toResponse(
        SavingsGoalProgressRow row
    ) {
        return new SavingsGoalProgressResponse(
            row.goalId(),
            row.goalName(),
            row.description(),
            row.currencyCode(),
            row.targetAmount(),
            row.contributedAmount(),
            row.remainingAmount(),
            row.progressPercentage(),
            row.targetReached(),
            row.targetDate(),
            row.daysRemaining(),
            row.contributionCount(),
            row.status(),
            row.completedAt(),
            row.archivedAt(),
            row.createdAt(),
            row.updatedAt()
        );
    }


    private static RecurringTransactionDueResponse
    toResponse(
        RecurringTransactionDueRow row
    ) {
        return new RecurringTransactionDueResponse(
            row.recurringTransactionId(),
            row.name(),
            row.transactionType(),
            row.amount(),
            row.frequency(),
            row.intervalCount(),
            row.nextDueDate(),
            row.daysOverdue(),
            row.autoPost(),
            row.accountId(),
            row.accountName(),
            row.currencyCode(),
            row.categoryId(),
            row.categoryName()
        );
    }

    private static NetWorthReportResponse
    toResponse(
        NetWorthRow row
    ) {
        return new NetWorthReportResponse(
            row.currencyCode(),
            row.netWorth(),
            row.includedAccountCount(),
            row.activeAccountCount(),
            row.archivedAccountCount()
        );
    }


    private static MonthlyCashFlowResponse
    toResponse(
        MonthlyCashFlowRow row
    ) {
        return new MonthlyCashFlowResponse(
            row.currencyCode(),
            row.monthStart(),
            row.totalIncome(),
            row.totalExpenses(),
            row.netCashFlow()
        );
    }


    private static MonthlyCategorySpendingResponse
    toResponse(
        MonthlyCategorySpendingRow row
    ) {
        return new MonthlyCategorySpendingResponse(
            row.currencyCode(),
            row.monthStart(),
            row.categoryId(),
            row.categoryName(),
            row.spentAmount(),
            row.transactionCount()
        );
    }
}
