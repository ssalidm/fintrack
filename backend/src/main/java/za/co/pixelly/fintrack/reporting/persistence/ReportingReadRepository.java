package za.co.pixelly.fintrack.reporting.persistence;


import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import za.co.pixelly.fintrack.reporting.api.*;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class ReportingReadRepository {

    private final JdbcTemplate jdbcTemplate;


    public List<AccountBalanceReportResponse> findAccountBalances(UUID userId) {
        return jdbcTemplate.query(
            """
                SELECT
                     account_id,
                     account_name,
                     account_type,
                     currency_code,
                     opening_balance,
                     transaction_total,
                     current_balance,
                     posted_transaction_count,
                     include_in_net_worth,
                     status,
                     created_at,
                     updated_at
                 FROM reporting.account_balances
                 WHERE user_id = ?
                 ORDER BY
                     currency_code,
                     account_name,
                     account_id
                """,
            (resultSet, rowNum) -> new AccountBalanceReportResponse(
                resultSet.getObject("account_id", UUID.class),
                resultSet.getString("account_name"),
                resultSet.getString("account_type"),
                resultSet.getString("currency_code"),
                resultSet.getBigDecimal("opening_balance"),
                resultSet.getBigDecimal("transaction_total"),
                resultSet.getBigDecimal("current_balance"),
                resultSet.getLong("posted_transaction_count"),
                resultSet.getBoolean("include_in_net_worth"),
                resultSet.getString("status"),
                resultSet.getTimestamp("created_at").toInstant(),
                resultSet.getTimestamp("updated_at").toInstant()
            ),
            userId
        );
    }


    public List<NetWorthReportResponse> findNetWorthByCurrency(UUID userId) {
        return jdbcTemplate.query(
            """
                SELECT
                    currency_code,
                    net_worth,
                    included_account_count,
                    active_account_count,
                    archived_account_count
                FROM reporting.net_worth_by_currency
                WHERE user_id = ?
                ORDER BY currency_code
                """,
            (resultSet, rowNum) -> new NetWorthReportResponse(
                resultSet.getString("currency_code"),
                resultSet.getBigDecimal("net_worth"),
                resultSet.getLong("included_account_count"),
                resultSet.getLong("active_account_count"),
                resultSet.getLong("archived_account_count")
            ),
            userId
        );
    }


    public List<MonthlyCashFlowResponse> findMonthlyCashFlow(
        UUID userId,
        LocalDate fromMonth,
        LocalDate toMonth
    ) {

        return jdbcTemplate.query(
            """
                SELECT
                    currency_code,
                    month_start,
                    total_income,
                    total_expenses,
                    net_cash_flow
                FROM reporting.monthly_cash_flow
                WHERE user_id = ?
                  AND month_start >= ?
                  AND month_start <= ?
                ORDER BY
                    month_start,
                    currency_code
                """,
            (resultSet, rowNum) ->
                new MonthlyCashFlowResponse(
                    resultSet.getString("currency_code"),
                    resultSet.getObject("month_start", LocalDate.class),
                    resultSet.getBigDecimal("total_income"),
                    resultSet.getBigDecimal("total_expenses"),
                    resultSet.getBigDecimal("net_cash_flow")
                ),
            userId,
            fromMonth,
            toMonth
        );
    }


    public List<MonthlyCategorySpendingResponse> findMonthlyCategorySpending(
        UUID userId,
        LocalDate fromMonth,
        LocalDate toMonth
    ) {

        return jdbcTemplate.query(
            """
                SELECT
                    currency_code,
                    month_start,
                    category_id,
                    category_name,
                    spent_amount,
                    transaction_count
                FROM reporting.monthly_category_spending
                WHERE user_id = ?
                  AND month_start >= ?
                  AND month_start <= ?
                ORDER BY
                    month_start,
                    currency_code,
                    spent_amount DESC,
                    category_name
                """,
            (resultSet, rowNum) ->
                new MonthlyCategorySpendingResponse(
                    resultSet.getString("currency_code"),
                    resultSet.getObject("month_start", LocalDate.class),
                    resultSet.getObject("category_id", UUID.class),
                    resultSet.getString("category_name"),
                    resultSet.getBigDecimal("spent_amount"),
                    resultSet.getLong("transaction_count")
                ),
            userId,
            fromMonth,
            toMonth
        );
    }


    public List<BudgetPerformanceRow> findBudgetPerformance(
        UUID userId,
        UUID budgetId
    ) {

        return jdbcTemplate.query(
            """
                SELECT
                    budget_id,
                    budget_name,
                    budget_month,
                    currency_code,
                    budget_status,
                    budget_limit_id,
                    category_id,
                    category_name,
                    limit_amount,
                    spent_amount,
                    remaining_amount,
                    utilization_percentage,
                    exceeded
                FROM reporting.budget_performance
                WHERE user_id = ?
                  AND budget_id = ?
                ORDER BY
                    exceeded DESC,
                    utilization_percentage DESC,
                    category_name
                """,
            (resultSet, rowNum) ->
                new BudgetPerformanceRow(
                    resultSet.getObject("budget_id", UUID.class),
                    resultSet.getString("budget_name"),
                    resultSet.getObject("budget_month", LocalDate.class),
                    resultSet.getString("currency_code"),
                    resultSet.getString("budget_status"),
                    resultSet.getObject("budget_limit_id", UUID.class),
                    resultSet.getObject("category_id", UUID.class),
                    resultSet.getString("category_name"),
                    resultSet.getBigDecimal("limit_amount"),
                    resultSet.getBigDecimal("spent_amount"),
                    resultSet.getBigDecimal("remaining_amount"),
                    resultSet.getBigDecimal("utilization_percentage"),
                    resultSet.getBoolean("exceeded")),
            userId,
            budgetId
        );
    }


    public boolean budgetExists(
        UUID userId,
        UUID budgetId
    ) {

        Boolean exists =
            jdbcTemplate.queryForObject(
                """
                    SELECT EXISTS (
                        SELECT 1
                        FROM finance.budgets
                        WHERE id = ?
                          AND user_id = ?
                    )
                    """,
                Boolean.class,
                budgetId,
                userId
            );

        return Boolean.TRUE.equals(
            exists
        );
    }


    public Optional<SavingsGoalProgressResponse> findSavingsGoalProgress(
        UUID userId,
        UUID goalId
    ) {

        List<SavingsGoalProgressResponse> results = jdbcTemplate.query(
            """
                SELECT
                    goal_id,
                    goal_name,
                    description,
                    currency_code,
                    target_amount,
                    contributed_amount,
                    remaining_amount,
                    progress_percentage,
                    target_reached,
                    target_date,
                    days_remaining,
                    contribution_count,
                    status,
                    completed_at,
                    archived_at,
                    created_at,
                    updated_at
                FROM reporting.savings_goal_progress
                WHERE user_id = ?
                  AND goal_id = ?
                """,
            (resultSet, rowNum) ->
                new SavingsGoalProgressResponse(
                    resultSet.getObject("goal_id", UUID.class),
                    resultSet.getString("goal_name"),
                    resultSet.getString("description"),
                    resultSet.getString("currency_code"),
                    resultSet.getBigDecimal("target_amount"),
                    resultSet.getBigDecimal("contributed_amount"),
                    resultSet.getBigDecimal("remaining_amount"),
                    resultSet.getBigDecimal("progress_percentage"),
                    resultSet.getBoolean("target_reached"),
                    resultSet.getObject("target_date", LocalDate.class),
                    resultSet.getObject("days_remaining", Integer.class),
                    resultSet.getLong("contribution_count"),
                    resultSet.getString("status"),
                    instant(resultSet, "completed_at"),
                    instant(resultSet, "archived_at"),
                    instant(resultSet, "created_at"),
                    instant(resultSet, "updated_at")),
            userId,
            goalId
        );

        return results.stream()
            .findFirst();
    }


    public List<RecurringTransactionDueResponse> findRecurringTransactionsDue(
        UUID userId,
        int limit
    ) {

        return jdbcTemplate.query(
            """
                SELECT
                    recurring_transaction_id,
                    name,
                    transaction_type,
                    amount,
                    frequency,
                    interval_count,
                    next_due_date,
                    days_overdue,
                    auto_post,
                    account_id,
                    account_name,
                    currency_code,
                    category_id,
                    category_name
                FROM reporting.recurring_transactions_due
                WHERE user_id = ?
                ORDER BY
                    next_due_date,
                    recurring_transaction_id
                LIMIT ?
                """,
            (resultSet, rowNum) ->
                new RecurringTransactionDueResponse(
                    resultSet.getObject("recurring_transaction_id", UUID.class),
                    resultSet.getString("name"),
                    resultSet.getString("transaction_type"),
                    resultSet.getBigDecimal("amount"),
                    resultSet.getString("frequency"),
                    resultSet.getShort("interval_count"),
                    resultSet.getObject("next_due_date", LocalDate.class),
                    resultSet.getInt("days_overdue"),
                    resultSet.getBoolean("auto_post"),
                    resultSet.getObject("account_id", UUID.class),
                    resultSet.getString("account_name"),
                    resultSet.getString("currency_code"),
                    resultSet.getObject("category_id", UUID.class),
                    resultSet.getString("category_name")),
            userId,
            limit
        );
    }


    public long countRecurringTransactionsDue(
        UUID userId
    ) {

        Long count = jdbcTemplate.queryForObject(
            """
                SELECT COUNT(*)
                FROM reporting.recurring_transactions_due
                WHERE user_id = ?
                """,
            Long.class,
            userId
        );

        return count == null
            ? 0L
            : count;
    }


    private static Instant instant(
        ResultSet resultSet,
        String column
    ) throws SQLException {

        var timestamp =
            resultSet.getTimestamp(
                column
            );

        return timestamp == null
            ? null
            : timestamp.toInstant();
    }
}
