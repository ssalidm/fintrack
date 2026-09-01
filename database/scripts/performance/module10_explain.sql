\set ON_ERROR_STOP on
\pset pager off

SELECT id AS performance_user_id
FROM identity.users
WHERE email = 'module10-performance@example.com'
\gset

\echo
\echo '========================================================='
\echo 'Query 1: Recent posted transactions'
\echo '========================================================='

EXPLAIN
    (
    ANALYZE,
    BUFFERS,
    SETTINGS,
    SUMMARY
    )
SELECT
    t.id,
    t.account_id,
    t.category_id,
    t.transaction_type,
    t.amount,
    t.transaction_date,
    t.created_at
FROM finance.transactions t
WHERE t.user_id = :'performance_user_id'::UUID
  AND t.status = 'POSTED'
ORDER BY
    t.transaction_date DESC,
    t.created_at DESC
LIMIT 20;

\echo
\echo '========================================================='
\echo 'Query 2: Current-month cash flow'
\echo '========================================================='

EXPLAIN
    (
    ANALYZE,
    BUFFERS,
    SETTINGS,
    SUMMARY
    )
SELECT
    SUM(
        CASE
            WHEN t.transaction_type = 'INCOME'
                THEN t.amount
            ELSE 0::NUMERIC
            END
    ) AS total_income,

    SUM(
        CASE
            WHEN t.transaction_type = 'EXPENSE'
                THEN t.amount
            ELSE 0::NUMERIC
            END
    ) AS total_expenses,

    SUM(
        CASE
            WHEN t.transaction_type = 'INCOME'
                THEN t.amount
            WHEN t.transaction_type = 'EXPENSE'
                THEN -t.amount
            ELSE 0::NUMERIC
            END
    ) AS net_cash_flow

FROM finance.transactions t

         JOIN finance.accounts a
              ON a.id = t.account_id
                  AND a.user_id = t.user_id

WHERE t.user_id = :'performance_user_id'::UUID
  AND t.status = 'POSTED'
  AND t.transaction_type IN (
                             'INCOME',
                             'EXPENSE'
    )
  AND t.transaction_date >=
      date_trunc('month', CURRENT_DATE)::DATE
  AND t.transaction_date <
      (
          date_trunc('month', CURRENT_DATE)
              + INTERVAL '1 month'
          )::DATE
  AND a.currency_code = 'ZAR';

\echo
\echo '========================================================='
\echo 'Query 3: Current-month category spending'
\echo '========================================================='

EXPLAIN
    (
    ANALYZE,
    BUFFERS,
    SETTINGS,
    SUMMARY
    )
SELECT
    c.id AS category_id,
    c.name AS category_name,
    SUM(t.amount) AS spent_amount,
    COUNT(*) AS transaction_count

FROM finance.transactions t

         JOIN finance.categories c
              ON c.id = t.category_id
                  AND c.user_id = t.user_id

         JOIN finance.accounts a
              ON a.id = t.account_id
                  AND a.user_id = t.user_id

WHERE t.user_id = :'performance_user_id'::UUID
  AND t.status = 'POSTED'
  AND t.transaction_type = 'EXPENSE'
  AND t.transaction_date >=
      date_trunc('month', CURRENT_DATE)::DATE
  AND t.transaction_date <
      (
          date_trunc('month', CURRENT_DATE)
              + INTERVAL '1 month'
          )::DATE
  AND a.currency_code = 'ZAR'

GROUP BY
    c.id,
    c.name

ORDER BY
    spent_amount DESC;

\echo
\echo '========================================================='
\echo 'Query 4: Calculated account balances'
\echo '========================================================='

EXPLAIN
    (
    ANALYZE,
    BUFFERS,
    SETTINGS,
    SUMMARY
    )
SELECT
    account_id,
    account_name,
    account_type,
    currency_code,
    current_balance
FROM reporting.account_balances
WHERE user_id = :'performance_user_id'::UUID
ORDER BY account_name;

\echo
\echo '========================================================='
\echo 'Query 5: Current-month budget performance'
\echo '========================================================='

EXPLAIN
    (
    ANALYZE,
    BUFFERS,
    SETTINGS,
    SUMMARY
    )
SELECT
    category_name,
    limit_amount,
    spent_amount,
    remaining_amount,
    utilization_percentage,
    exceeded
FROM reporting.budget_performance
WHERE user_id = :'performance_user_id'::UUID
  AND budget_month =
      date_trunc('month', CURRENT_DATE)::DATE
  AND currency_code = 'ZAR'
ORDER BY category_name;
