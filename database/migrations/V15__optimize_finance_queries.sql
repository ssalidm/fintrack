SET ROLE fintrack_owner;

-- =========================================================
-- Recent transactions and user-level cash-flow searches
-- =========================================================

CREATE INDEX ix_transactions_posted_user_recent
    ON finance.transactions
        (
         user_id,
         transaction_date DESC,
         created_at DESC
            )
    INCLUDE
        (
        id,
        account_id,
        category_id,
        transaction_type,
        amount
        )
    WHERE status = 'POSTED';

-- =========================================================
-- Monthly expense and category-spending searches
-- =========================================================

CREATE INDEX ix_transactions_posted_expense_user_date_category
    ON finance.transactions
        (
         user_id,
         transaction_date,
         category_id
            )
    INCLUDE
        (
        id,
        account_id,
        amount
        )
    WHERE status = 'POSTED'
        AND transaction_type = 'EXPENSE';

RESET ROLE;
