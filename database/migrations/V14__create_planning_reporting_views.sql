SET ROLE fintrack_owner;

-- =========================================================
-- Budget performance
-- =========================================================

CREATE VIEW reporting.budget_performance AS
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

-- =========================================================
-- Savings-goal progress
-- =========================================================

CREATE VIEW reporting.savings_goal_progress AS
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

-- =========================================================
-- Recurring schedules currently due
-- =========================================================

CREATE VIEW reporting.recurring_transactions_due AS
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

RESET ROLE;
