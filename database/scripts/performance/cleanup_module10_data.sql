\set ON_ERROR_STOP on

SET ROLE fintrack_owner;

DO
$$
    DECLARE
        v_user_id UUID;
    BEGIN
        SELECT id
        INTO v_user_id
        FROM identity.users
        WHERE email = 'module10-performance@example.com';

        IF v_user_id IS NULL THEN
            RAISE NOTICE
                'Module 10 performance data does not exist.';

            RETURN;
        END IF;

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
    END
$$;

VACUUM (ANALYZE) finance.transactions;
VACUUM (ANALYZE) finance.accounts;
VACUUM (ANALYZE) finance.categories;
VACUUM (ANALYZE) finance.budgets;
VACUUM (ANALYZE) finance.goal_contributions;
VACUUM (ANALYZE) finance.recurring_transactions;

RESET ROLE;
