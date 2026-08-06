SET ROLE fintrack_owner;

-- =========================================================
-- Calculated account balances
-- =========================================================

CREATE OR REPLACE VIEW reporting.account_balances AS
SELECT
    a.id AS account_id,
    a.user_id,
    a.name AS account_name,
    a.account_type,
    a.currency_code,
    a.opening_balance,

    COALESCE(
            SUM(
            CASE t.transaction_type
                WHEN 'INCOME' THEN t.amount
                WHEN 'TRANSFER_IN' THEN t.amount
                WHEN 'EXPENSE' THEN -t.amount
                WHEN 'TRANSFER_OUT' THEN -t.amount
                ELSE 0::NUMERIC
                END
               ) FILTER (
                WHERE t.status = 'POSTED'
                ),
            0::NUMERIC
    )::NUMERIC(19, 4) AS transaction_total,

    (
        a.opening_balance
            +
        COALESCE(
                SUM(
                CASE t.transaction_type
                    WHEN 'INCOME' THEN t.amount
                    WHEN 'TRANSFER_IN' THEN t.amount
                    WHEN 'EXPENSE' THEN -t.amount
                    WHEN 'TRANSFER_OUT' THEN -t.amount
                    ELSE 0::NUMERIC
                    END
                   ) FILTER (
                    WHERE t.status = 'POSTED'
                    ),
                0::NUMERIC
        )
        )::NUMERIC(19, 4) AS current_balance,

    COUNT(t.id) FILTER (
        WHERE t.status = 'POSTED'
        ) AS posted_transaction_count,

    a.include_in_net_worth,
    a.status,
    a.created_at,
    a.updated_at
FROM finance.accounts a
         LEFT JOIN finance.transactions t
                   ON t.account_id = a.id
                       AND t.user_id = a.user_id
GROUP BY
    a.id,
    a.user_id,
    a.name,
    a.account_type,
    a.currency_code,
    a.opening_balance,
    a.include_in_net_worth,
    a.status,
    a.created_at,
    a.updated_at;
;

-- =========================================================
-- Monthly cash flow
-- Transfers are deliberately excluded.
-- =========================================================

CREATE OR REPLACE VIEW reporting.monthly_cash_flow AS
SELECT
    t.user_id,
    a.currency_code,
    date_trunc(
        'month',
        t.transaction_date::TIMESTAMP
    )::DATE AS month_start,

    SUM(
        CASE
            WHEN t.transaction_type = 'INCOME'
                THEN t.amount
            ELSE 0::NUMERIC
            END
    )::NUMERIC(19, 4) AS total_income,

    SUM(
        CASE
            WHEN t.transaction_type = 'EXPENSE'
                THEN t.amount
            ELSE 0::NUMERIC
            END
    )::NUMERIC(19, 4) AS total_expenses,

    SUM(
        CASE
            WHEN t.transaction_type = 'INCOME'
                THEN t.amount
            WHEN t.transaction_type = 'EXPENSE'
                THEN -t.amount
            ELSE 0::NUMERIC
            END
    )::NUMERIC(19, 4) AS net_cash_flow

FROM finance.transactions t
         JOIN finance.accounts a
              ON a.id = t.account_id
                  AND a.user_id = t.user_id
WHERE t.status = 'POSTED'
  AND t.transaction_type IN (
                             'INCOME',
                             'EXPENSE'
    )
GROUP BY
    t.user_id,
    a.currency_code,
    date_trunc(
        'month',
        t.transaction_date::TIMESTAMP
    )::DATE;
;

-- =========================================================
-- Budget performance
-- =========================================================

CREATE OR REPLACE VIEW reporting.budget_performance AS
WITH category_spending AS
         (
             SELECT
                 b.id AS budget_id,
                 b.user_id,
                 l.id AS budget_limit_id,

                 COALESCE(
                         SUM(t.amount)
                         FILTER (
                             WHERE a.id IS NOT NULL
                             ),
                         0::NUMERIC
                 )::NUMERIC(19, 4) AS spent_amount

             FROM finance.budgets b

                      JOIN finance.budget_category_limits l
                           ON l.budget_id = b.id
                               AND l.user_id = b.user_id

                      LEFT JOIN finance.transactions t
                                ON t.user_id = b.user_id
                                    AND t.category_id = l.category_id
                                    AND t.transaction_type = 'EXPENSE'
                                    AND t.status = 'POSTED'
                                    AND t.transaction_date >= b.budget_month
                                    AND t.transaction_date <
                                        (b.budget_month + INTERVAL '1 month')::DATE

                      LEFT JOIN finance.accounts a
                                ON a.id = t.account_id
                                    AND a.user_id = t.user_id
                                    AND a.currency_code = b.currency_code

             GROUP BY
                 b.id,
                 b.user_id,
                 l.id
         )
SELECT
    b.id AS budget_id,
    b.user_id,
    b.name AS budget_name,
    b.budget_month,
    b.currency_code,
    b.status AS budget_status,

    l.id AS budget_limit_id,
    c.id AS category_id,
    c.name AS category_name,

    l.limit_amount,
    spending.spent_amount,

    (
        l.limit_amount
            - spending.spent_amount
        )::NUMERIC(19, 4) AS remaining_amount,

    ROUND(
        (
            spending.spent_amount
                / l.limit_amount
            ) * 100,
        2
    ) AS utilization_percentage,

    spending.spent_amount > l.limit_amount AS exceeded

FROM finance.budgets b

         JOIN finance.budget_category_limits l
              ON l.budget_id = b.id
                  AND l.user_id = b.user_id

         JOIN finance.categories c
              ON c.id = l.category_id
                  AND c.user_id = l.user_id

         JOIN category_spending spending
              ON spending.budget_id = b.id
                  AND spending.budget_limit_id = l.id;
;

-- =========================================================
-- Savings-goal progress
-- =========================================================

CREATE OR REPLACE VIEW reporting.savings_goal_progress AS
WITH contribution_totals AS
         (
             SELECT
                 g.id AS goal_id,
                 g.user_id,

                 COALESCE(
                         SUM(c.amount)
                         FILTER (
                             WHERE c.status = 'POSTED'
                             ),
                         0::NUMERIC
                 )::NUMERIC(19, 4) AS contributed_amount,

                 COUNT(c.id)
                 FILTER (
                     WHERE c.status = 'POSTED'
                     ) AS contribution_count

             FROM finance.savings_goals g

                      LEFT JOIN finance.goal_contributions c
                                ON c.goal_id = g.id
                                    AND c.user_id = g.user_id

             GROUP BY
                 g.id,
                 g.user_id
         )
SELECT
    g.id AS goal_id,
    g.user_id,
    g.name AS goal_name,
    g.description,
    g.currency_code,
    g.target_amount,
    totals.contributed_amount,

    GREATEST(
        g.target_amount - totals.contributed_amount,
        0::NUMERIC
    )::NUMERIC(19, 4) AS remaining_amount,

    ROUND(
        (
            totals.contributed_amount
                / g.target_amount
            ) * 100,
        2
    ) AS progress_percentage,

    totals.contributed_amount >= g.target_amount AS target_reached,

    g.target_date,

    CASE
        WHEN g.target_date IS NULL
            THEN NULL
        ELSE g.target_date - CURRENT_DATE
        END AS days_remaining,

    totals.contribution_count,
    g.status,
    g.completed_at,
    g.archived_at,
    g.created_at,
    g.updated_at

FROM finance.savings_goals g

         JOIN contribution_totals totals
              ON totals.goal_id = g.id
                  AND totals.user_id = g.user_id;
;

-- =========================================================
-- Recurring schedules currently due
-- =========================================================

CREATE OR REPLACE VIEW reporting.recurring_transactions_due AS
SELECT
    r.id AS recurring_transaction_id,
    r.user_id,
    r.name,
    r.transaction_type,
    r.amount,
    r.frequency,
    r.interval_count,
    r.next_due_date,
    CURRENT_DATE - r.next_due_date AS days_overdue,
    r.auto_post,

    a.id AS account_id,
    a.name AS account_name,
    a.currency_code,

    c.id AS category_id,
    c.name AS category_name

FROM finance.recurring_transactions r

         JOIN finance.accounts a
              ON a.id = r.account_id
                  AND a.user_id = r.user_id

         JOIN finance.categories c
              ON c.id = r.category_id
                  AND c.user_id = r.user_id

WHERE r.status = 'ACTIVE'
  AND r.next_due_date <= CURRENT_DATE;

GRANT SELECT
    ON TABLE
    reporting.budget_performance,
    reporting.savings_goal_progress,
    reporting.recurring_transactions_due
    TO fintrack_application;
;

-- =========================================================
-- Monthly spending by expense category
-- =========================================================

CREATE OR REPLACE VIEW reporting.monthly_category_spending AS
SELECT
    t.user_id,
    a.currency_code,

    date_trunc(
        'month',
        t.transaction_date::TIMESTAMP
    )::DATE AS month_start,

    c.id AS category_id,
    c.name AS category_name,

    SUM(t.amount)::NUMERIC(19, 4) AS spent_amount,

    COUNT(t.id) AS transaction_count

FROM finance.transactions t

         JOIN finance.accounts a
              ON a.id = t.account_id
                  AND a.user_id = t.user_id

         JOIN finance.categories c
              ON c.id = t.category_id
                  AND c.user_id = t.user_id

WHERE t.status = 'POSTED'
  AND t.transaction_type = 'EXPENSE'

GROUP BY
    t.user_id,
    a.currency_code,
    date_trunc(
        'month',
        t.transaction_date::TIMESTAMP
    )::DATE,
    c.id,
    c.name;

-- =========================================================
-- Net worth grouped by currency
-- =========================================================

CREATE OR REPLACE VIEW reporting.net_worth_by_currency AS
SELECT
    user_id,
    currency_code,

    SUM(current_balance)::NUMERIC(19, 4)
             AS net_worth,

    COUNT(*) AS included_account_count,

    COUNT(*) FILTER (
        WHERE status = 'ACTIVE'
        ) AS active_account_count,

    COUNT(*) FILTER (
        WHERE status = 'ARCHIVED'
        ) AS archived_account_count

FROM reporting.account_balances

WHERE include_in_net_worth = TRUE

GROUP BY
    user_id,
    currency_code;

GRANT SELECT
    ON TABLE
    reporting.monthly_category_spending,
    reporting.net_worth_by_currency
    TO fintrack_application;

GRANT SELECT
    ON TABLE
    reporting.account_balances,
    reporting.monthly_cash_flow,
    reporting.budget_performance,
    reporting.savings_goal_progress,
    reporting.recurring_transactions_due,
    reporting.monthly_category_spending,
    reporting.net_worth_by_currency
    TO fintrack_application;

RESET ROLE;
