SET ROLE fintrack_owner;

-- =========================================================
-- Recurring transaction schedules
-- =========================================================

CREATE TABLE finance.recurring_transactions
(
    id                  UUID           NOT NULL DEFAULT gen_random_uuid(),
    user_id             UUID           NOT NULL,
    account_id          UUID           NOT NULL,
    category_id         UUID           NOT NULL,
    name                VARCHAR(100)   NOT NULL,
    transaction_type    VARCHAR(20)    NOT NULL,
    amount              NUMERIC(19, 4) NOT NULL,
    description         VARCHAR(500),
    merchant_name       VARCHAR(200),
    frequency           VARCHAR(16)    NOT NULL,
    interval_count      SMALLINT       NOT NULL DEFAULT 1,
    start_date          DATE           NOT NULL,
    next_due_date       DATE,
    end_date            DATE,
    last_generated_date DATE,
    auto_post           BOOLEAN        NOT NULL DEFAULT FALSE,
    status              VARCHAR(16)    NOT NULL DEFAULT 'ACTIVE',
    completed_at        TIMESTAMPTZ(6),
    archived_at         TIMESTAMPTZ(6),
    created_at          TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version             BIGINT         NOT NULL DEFAULT 0,

    CONSTRAINT pk_recurring_transactions
        PRIMARY KEY (id),

    CONSTRAINT uq_recurring_transactions_id_user
        UNIQUE (id, user_id),

    CONSTRAINT fk_recurring_transactions_account
        FOREIGN KEY (account_id, user_id)
            REFERENCES finance.accounts (id, user_id)
            ON DELETE RESTRICT,

    CONSTRAINT fk_recurring_transactions_category
        FOREIGN KEY (category_id, user_id)
            REFERENCES finance.categories (id, user_id)
            ON DELETE RESTRICT,

    CONSTRAINT ck_recurring_transactions_name
        CHECK (btrim(name) <> ''),

    CONSTRAINT ck_recurring_transactions_type
        CHECK (
            transaction_type IN (
                                 'INCOME',
                                 'EXPENSE'
                )
            ),

    CONSTRAINT ck_recurring_transactions_amount
        CHECK (amount > 0),

    CONSTRAINT ck_recurring_transactions_description
        CHECK (
            description IS NULL
                OR btrim(description) <> ''
            ),

    CONSTRAINT ck_recurring_transactions_merchant
        CHECK (
            merchant_name IS NULL
                OR btrim(merchant_name) <> ''
            ),

    CONSTRAINT ck_recurring_transactions_frequency
        CHECK (
            frequency IN (
                          'DAILY',
                          'WEEKLY',
                          'MONTHLY',
                          'YEARLY'
                )
            ),

    CONSTRAINT ck_recurring_transactions_interval
        CHECK (interval_count BETWEEN 1 AND 365),

    CONSTRAINT ck_recurring_transactions_end_date
        CHECK (
            end_date IS NULL
                OR end_date >= start_date
            ),

    CONSTRAINT ck_recurring_transactions_next_due
        CHECK (
            next_due_date IS NULL
                OR (
                next_due_date >= start_date
                    AND (
                    end_date IS NULL
                        OR next_due_date <= end_date
                    )
                )
            ),

    CONSTRAINT ck_recurring_transactions_last_generated
        CHECK (
            last_generated_date IS NULL
                OR last_generated_date >= start_date
            ),

    CONSTRAINT ck_recurring_transactions_status
        CHECK (
            status IN (
                       'ACTIVE',
                       'PAUSED',
                       'COMPLETED',
                       'ARCHIVED'
                )
            ),

    CONSTRAINT ck_recurring_transactions_state
        CHECK (
            (
                status IN ('ACTIVE', 'PAUSED')
                    AND next_due_date IS NOT NULL
                    AND completed_at IS NULL
                    AND archived_at IS NULL
                )
                OR
            (
                status = 'COMPLETED'
                    AND next_due_date IS NULL
                    AND completed_at IS NOT NULL
                    AND archived_at IS NULL
                )
                OR
            (
                status = 'ARCHIVED'
                    AND archived_at IS NOT NULL
                )
            ),

    CONSTRAINT ck_recurring_transactions_completed_after_creation
        CHECK (
            completed_at IS NULL
                OR completed_at >= created_at
            ),

    CONSTRAINT ck_recurring_transactions_archived_after_creation
        CHECK (
            archived_at IS NULL
                OR archived_at >= created_at
            ),

    CONSTRAINT ck_recurring_transactions_updated_after_creation
        CHECK (updated_at >= created_at),

    CONSTRAINT ck_recurring_transactions_version
        CHECK (version >= 0)
);

CREATE UNIQUE INDEX uq_recurring_transactions_open_user_name
    ON finance.recurring_transactions
        (
         user_id,
         lower(btrim(name))
            )
    WHERE status IN (
                     'ACTIVE',
                     'PAUSED'
        );

CREATE INDEX ix_recurring_transactions_due
    ON finance.recurring_transactions
        (
         next_due_date,
         user_id
            )
    WHERE status = 'ACTIVE';

CREATE INDEX ix_recurring_transactions_user_status
    ON finance.recurring_transactions
        (
         user_id,
         status,
         next_due_date
            );

-- =========================================================
-- Validate recurring account and category
-- =========================================================

CREATE OR REPLACE FUNCTION finance.validate_recurring_transaction()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SET search_path = pg_catalog
AS
$$
DECLARE
    v_account_status  VARCHAR(16);
    v_category_type   VARCHAR(20);
    v_category_status VARCHAR(16);
BEGIN
    IF TG_OP = 'UPDATE'
        AND NEW.user_id IS DISTINCT FROM OLD.user_id THEN
        RAISE EXCEPTION
            'Recurring-transaction ownership cannot be changed.';
    END IF;

    SELECT a.status
    INTO v_account_status
    FROM finance.accounts a
    WHERE a.id = NEW.account_id
      AND a.user_id = NEW.user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION
            'The selected account does not belong to the user.';
    END IF;

    SELECT
        c.category_type,
        c.status
    INTO
        v_category_type,
        v_category_status
    FROM finance.categories c
    WHERE c.id = NEW.category_id
      AND c.user_id = NEW.user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION
            'The selected category does not belong to the user.';
    END IF;

    IF v_category_type <> NEW.transaction_type THEN
        RAISE EXCEPTION
            'Recurring transaction type % requires a % category.',
            NEW.transaction_type,
            NEW.transaction_type;
    END IF;

    IF (
           TG_OP = 'INSERT'
               OR NEW.account_id IS DISTINCT FROM OLD.account_id
               OR (
               OLD.status IS DISTINCT FROM 'ACTIVE'
                   AND NEW.status = 'ACTIVE'
               )
           )
        AND v_account_status <> 'ACTIVE' THEN
        RAISE EXCEPTION
            'Active recurring transactions require an active account.';
    END IF;

    IF (
           TG_OP = 'INSERT'
               OR NEW.category_id IS DISTINCT FROM OLD.category_id
               OR (
               OLD.status IS DISTINCT FROM 'ACTIVE'
                   AND NEW.status = 'ACTIVE'
               )
           )
        AND v_category_status <> 'ACTIVE' THEN
        RAISE EXCEPTION
            'Active recurring transactions require an active category.';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_recurring_transaction
    BEFORE INSERT OR UPDATE
    ON finance.recurring_transactions
    FOR EACH ROW
EXECUTE FUNCTION finance.validate_recurring_transaction();

REVOKE ALL
    ON FUNCTION finance.validate_recurring_transaction()
    FROM PUBLIC;

-- =========================================================
-- Link generated transactions to schedules
-- =========================================================

ALTER TABLE finance.transactions
    ADD COLUMN recurring_transaction_id UUID,
    ADD COLUMN recurrence_due_date DATE;

ALTER TABLE finance.transactions
    ADD CONSTRAINT fk_transactions_recurring_schedule
        FOREIGN KEY (recurring_transaction_id, user_id)
            REFERENCES finance.recurring_transactions (id, user_id)
            ON DELETE RESTRICT;

ALTER TABLE finance.transactions
    ADD CONSTRAINT ck_transactions_recurring_shape
        CHECK (
            (
                recurring_transaction_id IS NULL
                    AND recurrence_due_date IS NULL
                )
                OR
            (
                recurring_transaction_id IS NOT NULL
                    AND recurrence_due_date IS NOT NULL
                    AND transaction_type IN (
                                             'INCOME',
                                             'EXPENSE'
                    )
                    AND transfer_id IS NULL
                )
            );

-- Prevent the scheduler from generating the same occurrence twice.
CREATE UNIQUE INDEX uq_transactions_recurring_occurrence
    ON finance.transactions
        (
         recurring_transaction_id,
         recurrence_due_date
            )
    WHERE recurring_transaction_id IS NOT NULL;

CREATE INDEX ix_transactions_recurring_schedule
    ON finance.transactions
        (
         recurring_transaction_id,
         recurrence_due_date DESC
            )
    WHERE recurring_transaction_id IS NOT NULL;

RESET ROLE;
