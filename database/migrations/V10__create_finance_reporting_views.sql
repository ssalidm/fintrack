SET ROLE fintrack_owner;

-- =========================================================
-- Calculated account balances
-- =========================================================

CREATE VIEW reporting.account_balances AS
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

-- =========================================================
-- Monthly cash flow
-- Transfers are deliberately excluded.
-- =========================================================

CREATE VIEW reporting.monthly_cash_flow AS
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

RESET ROLE;
