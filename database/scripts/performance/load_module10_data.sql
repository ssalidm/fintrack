\set ON_ERROR_STOP on

SET ROLE fintrack_owner;


-- =========================================================
-- Remove a previous module 10 data set
-- =========================================================

DO
$$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT  id
    INTO v_user_id
    FROM identity.users
    WHERE email = 'module10-performance@example.com';

    IF v_user_id IS NOT NULL THEN
        DELETE FROM finance.transactions
        WHERE user_id = v_user_id;

        DELETE FROM finance.transfers
        WHERE user_id = v_user_id;

        DELETE FROM finance.goal_contributions
        WHERE user_id = v_user_id;

        DELETE FROM finance.savings_goals
        WHERE user_id = v_user_id;

        DELETE FROM finance.budget_category_limits
        WHERE user_id = v_user_id;

        DELETE FROM finance.budgets
        WHERE user_id = v_user_id;

        DELETE FROM finance.recurring_transactions
        WHERE user_id = v_user_id;

        DELETE FROM finance.categories
        WHERE user_id = v_user_id;

        DELETE FROM finance.accounts
        WHERE user_id = v_user_id;

        DELETE FROM identity.refresh_tokens
        WHERE user_id = v_user_id;

        DELETE FROM identity.auth_sessions
        WHERE user_id = v_user_id;

        DELETE FROM identity.email_verification_tokens
        WHERE user_id = v_user_id;

        DELETE FROM identity.password_reset_tokens
        WHERE user_id = v_user_id;

        DELETE FROM identity.user_roles
        WHERE user_id = v_user_id;

        DELETE FROM identity.users
        WHERE id = v_user_id;
    END IF;
END
$$;


-- =========================================================
-- Performance-test user
-- =========================================================

INSERT INTO identity.users
(
    email,
    password_hash,
    first_name,
    last_name,
    status,
    email_verified_at
)
VALUES
(
    'module10-performance@example.com',
    'module-10-development-only-password-hash',
    'performance',
    'Tester',
    'ACTIVE',
    CURRENT_TIMESTAMP
)
RETURNING id AS performance_user_id
\gset


-- =========================================================
-- Default categories
-- =========================================================

INSERT INTO finance.categories
(
    user_id,
    template_code,
    name,
    category_type,
    display_order
)
SELECT
    :'performance_user_id'::UUID,
    code,
    name,
    category_type,
    display_order
FROM finance.category_templates
WHERE active = TRUE;


-- =========================================================
-- Accounts
-- =========================================================

INSERT INTO finance.accounts
(
    user_id,
    name,
    account_type,
    currency_code,
    opening_balance
)
VALUES
(
    :'performance_user_id'::UUID,
    'Performance Current Account',
    'CURRENT',
    'ZAR',
    5000.00
)
RETURNING id AS current_account_id
\gset

INSERT INTO finance.accounts
(
    user_id,
    name,
    account_type,
    currency_code,
    opening_balance
)
VALUES
(
    :'performance_user_id'::UUID,
    'Performance Savings Account',
    'SAVINGS',
    'ZAR',
    20000.00
)
RETURNING id AS savings_account_id
\gset

INSERT INTO finance.accounts
(
    user_id,
    name,
    account_type,
    currency_code,
    opening_balance
)
VALUES
(
    :'performance_user_id'::UUID,
    'Performance Credit Card',
    'CREDIT_CARD',
    'ZAR',
    0.00
)
RETURNING id AS credit_card_id
\gset


-- =========================================================
-- Generate 30,000 transactions over approximately two years
-- =========================================================

WITH category_ids AS
(
    SELECT
        (
            SELECT id
            FROM finance.categories
            WHERE user_id = :'performance_user_id'::UUID
                AND template_code = 'SALARY'
        ) AS salary_id,

        (
            SELECT id
            FROM finance.categories
            WHERE user_id = :'performance_user_id'::UUID
                AND template_code = 'GROCERIES'
        ) AS groceries_id,

        (
            SELECT id
            FROM finance.categories
            WHERE user_id = :'performance_user_id'::UUID
                AND template_code = 'TRANSPORT'
        ) AS transport_id,

        (
            SELECT id
            FROM finance.categories
            WHERE user_id = :'performance_user_id'::UUID
                AND template_code = 'RENT'
        ) AS rent_id,

        (
            SELECT id
            FROM finance.categories
            WHERE user_id = :'performance_user_id'::UUID
                AND template_code = 'SUBSCRIPTIONS'
        ) AS subscriptions_id
)
INSERT INTO finance.transactions
(
    user_id,
    account_id,
    category_id,
    transaction_type,
    amount,
    transaction_date,
    description,
    merchant_name
)
SELECT
    :'performance_user_id'::UUID,

    CASE
        WHEN generated_number % 100 = 0
            THEN :'current_account_id'::UUID
        WHEN generated_number % 4 = 0
            THEN :'credit_card_id'::UUID
        ELSE :'current_account_id'::UUID
    END,

    CASE
        WHEN generated_number % 100 = 0
            THEN category_ids.salary_id
        WHEN generated_number % 13 = 0
            THEN category_ids.rent_id
        WHEN generated_number % 5 = 0
            THEN category_ids.groceries_id
        WHEN generated_number % 3 = 0
            THEN category_ids.transport_id
        ELSE category_ids.subscriptions_id
    END,

    CASE
        WHEN generated_number % 100 = 0
            THEN 'INCOME'
        ELSE 'EXPENSE'
    END,

    CASE
        WHEN generated_number % 100 = 0
            THEN (
            15000
                + generated_number % 1000
            )::NUMERIC(19, 4)
        ELSE (
            25
                + (
                      (generated_number * 37) % 5000
                      )::NUMERIC / 10
            )::NUMERIC(19, 4)
        END,

    CURRENT_DATE - (
        (generated_number - 1) % 730
        ),

    'Generated Module 10 transaction '
        || generated_number,

    CASE
        WHEN generated_number % 100 = 0
            THEN NULL
        ELSE 'Merchant '
            || (
                 generated_number % 120
                 )
        END

FROM generate_series(1, 30000)
         AS generated(generated_number)

         CROSS JOIN category_ids;


-- =========================================================
-- Current-month budget
-- =========================================================

INSERT INTO finance.budgets
(
    user_id,
    name,
    budget_month,
    currency_code
)
VALUES
    (
        :'performance_user_id'::UUID,
        'Module 10 Performance Budget',
        date_trunc('month', CURRENT_DATE)::DATE,
        'ZAR'
    )
RETURNING id AS performance_budget_id
\gset

INSERT INTO finance.budget_category_limits
(
    budget_id,
    user_id,
    category_id,
    limit_amount
)
SELECT
    :'performance_budget_id'::UUID,
    :'performance_user_id'::UUID,
    id,
    CASE template_code
        WHEN 'GROCERIES' THEN 5000.00
        WHEN 'TRANSPORT' THEN 3000.00
        WHEN 'RENT' THEN 10000.00
        WHEN 'SUBSCRIPTIONS' THEN 1500.00
        END
FROM finance.categories
WHERE user_id = :'performance_user_id'::UUID
  AND template_code IN (
                        'GROCERIES',
                        'TRANSPORT',
                        'RENT',
                        'SUBSCRIPTIONS'
    );


-- =========================================================
-- Savings goal and contribution history
-- =========================================================

INSERT INTO finance.savings_goals
(
    user_id,
    name,
    currency_code,
    target_amount,
    target_date
)
VALUES
    (
        :'performance_user_id'::UUID,
        'Module 10 Emergency Fund',
        'ZAR',
        100000.00,
        CURRENT_DATE + 365
    )
RETURNING id AS performance_goal_id
\gset

INSERT INTO finance.goal_contributions
(
    goal_id,
    user_id,
    amount,
    contribution_date,
    note
)
SELECT
    :'performance_goal_id'::UUID,
    :'performance_user_id'::UUID,
    (
        50
            + generated_number % 500
        )::NUMERIC(19, 4),
    CURRENT_DATE - (
        generated_number % 365
        ),
    'Generated contribution '
        || generated_number
FROM generate_series(1, 500)
         AS generated(generated_number);


-- =========================================================
-- Recurring schedules
-- =========================================================

WITH category_ids AS
         (
             SELECT
                 (
                     SELECT id
                     FROM finance.categories
                     WHERE user_id = :'performance_user_id'::UUID
                       AND template_code = 'SALARY'
                 ) AS salary_id,

                 (
                     SELECT id
                     FROM finance.categories
                     WHERE user_id = :'performance_user_id'::UUID
                       AND template_code = 'RENT'
                 ) AS rent_id
         )
INSERT INTO finance.recurring_transactions
(
    user_id,
    account_id,
    category_id,
    name,
    transaction_type,
    amount,
    description,
    frequency,
    interval_count,
    start_date,
    next_due_date,
    auto_post
)
SELECT
    :'performance_user_id'::UUID,
    :'current_account_id'::UUID,

    CASE
        WHEN generated_number % 10 = 0
            THEN category_ids.salary_id
        ELSE category_ids.rent_id
        END,

    'Module 10 Schedule '
        || generated_number,

    CASE
        WHEN generated_number % 10 = 0
            THEN 'INCOME'
        ELSE 'EXPENSE'
        END,

    CASE
        WHEN generated_number % 10 = 0
            THEN 15000.00
        ELSE 8000.00
        END,

    'Generated recurring schedule',

    'MONTHLY',
    1,
    CURRENT_DATE - 365,
    CURRENT_DATE - (
        generated_number % 20
        ),
    FALSE

FROM generate_series(1, 100)
         AS generated(generated_number)

         CROSS JOIN category_ids;


-- =========================================================
-- Refresh planner statistics
-- =========================================================

VACUUM (ANALYZE) finance.transactions;
VACUUM (ANALYZE) finance.accounts;
VACUUM (ANALYZE) finance.categories;
VACUUM (ANALYZE) finance.budgets;
VACUUM (ANALYZE) finance.budget_category_limits;
VACUUM (ANALYZE) finance.goal_contributions;
VACUUM (ANALYZE) finance.recurring_transactions;

SELECT
    count(*) AS generated_transaction_count
FROM finance.transactions
WHERE user_id = :'performance_user_id'::UUID;

RESET ROLE;
