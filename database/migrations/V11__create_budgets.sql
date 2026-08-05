SET ROLE fintrack_owner;

-- =========================================================
-- Monthly budgets
-- =========================================================

CREATE TABLE finance.budgets
(
    id            UUID           NOT NULL DEFAULT gen_random_uuid(),
    user_id       UUID           NOT NULL,
    name          VARCHAR(100)   NOT NULL,
    budget_month  DATE           NOT NULL,
    currency_code VARCHAR(3)     NOT NULL,
    status        VARCHAR(16)    NOT NULL DEFAULT 'ACTIVE',
    archived_at   TIMESTAMPTZ(6),
    created_at    TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version       BIGINT         NOT NULL DEFAULT 0,

    CONSTRAINT pk_budgets
        PRIMARY KEY (id),

    CONSTRAINT uq_budgets_id_user
        UNIQUE (id, user_id),

    CONSTRAINT fk_budgets_user
        FOREIGN KEY (user_id)
            REFERENCES identity.users (id)
            ON DELETE RESTRICT,

    CONSTRAINT fk_budgets_currency
        FOREIGN KEY (currency_code)
            REFERENCES finance.currencies (code)
            ON UPDATE RESTRICT
            ON DELETE RESTRICT,

    CONSTRAINT ck_budgets_name_not_blank
        CHECK (btrim(name) <> ''),

    CONSTRAINT ck_budgets_month_start
        CHECK (
            budget_month =
            date_trunc(
                'month',
                budget_month::TIMESTAMP
            )::DATE
            ),

    CONSTRAINT ck_budgets_status
        CHECK (
            status IN (
                       'ACTIVE',
                       'ARCHIVED'
                )
            ),

    CONSTRAINT ck_budgets_archive_state
        CHECK (
            (
                status = 'ACTIVE'
                    AND archived_at IS NULL
                )
                OR
            (
                status = 'ARCHIVED'
                    AND archived_at IS NOT NULL
                )
            ),

    CONSTRAINT ck_budgets_archived_after_creation
        CHECK (
            archived_at IS NULL
                OR archived_at >= created_at
            ),

    CONSTRAINT ck_budgets_updated_after_creation
        CHECK (updated_at >= created_at),

    CONSTRAINT ck_budgets_version
        CHECK (version >= 0)
);

-- Only one active budget is permitted for a user, month, and currency.
CREATE UNIQUE INDEX uq_budgets_active_user_month_currency
    ON finance.budgets
        (
         user_id,
         budget_month,
         currency_code
            )
    WHERE status = 'ACTIVE';

CREATE INDEX ix_budgets_user_month
    ON finance.budgets
        (
         user_id,
         budget_month DESC,
         currency_code
            );

-- =========================================================
-- Per-category spending limits
-- =========================================================

CREATE TABLE finance.budget_category_limits
(
    id           UUID           NOT NULL DEFAULT gen_random_uuid(),
    budget_id    UUID           NOT NULL,
    user_id      UUID           NOT NULL,
    category_id  UUID           NOT NULL,
    limit_amount NUMERIC(19, 4) NOT NULL,
    created_at   TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version      BIGINT         NOT NULL DEFAULT 0,

    CONSTRAINT pk_budget_category_limits
        PRIMARY KEY (id),

    CONSTRAINT fk_budget_category_limits_budget
        FOREIGN KEY (budget_id, user_id)
            REFERENCES finance.budgets (id, user_id)
            ON DELETE RESTRICT,

    CONSTRAINT fk_budget_category_limits_category
        FOREIGN KEY (category_id, user_id)
            REFERENCES finance.categories (id, user_id)
            ON DELETE RESTRICT,

    CONSTRAINT uq_budget_category_limits_category
        UNIQUE (budget_id, category_id),

    CONSTRAINT ck_budget_category_limits_amount
        CHECK (limit_amount > 0),

    CONSTRAINT ck_budget_category_limits_updated
        CHECK (updated_at >= created_at),

    CONSTRAINT ck_budget_category_limits_version
        CHECK (version >= 0)
);

CREATE INDEX ix_budget_category_limits_user
    ON finance.budget_category_limits
        (
         user_id,
         budget_id
            );

-- =========================================================
-- Cross-table budget validation
-- =========================================================

CREATE OR REPLACE FUNCTION finance.validate_budget_category_limit()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SET search_path = pg_catalog
AS
$$
DECLARE
    v_budget_status  VARCHAR(16);
    v_category_type  VARCHAR(20);
    v_category_status VARCHAR(16);
BEGIN
    IF TG_OP = 'UPDATE'
        AND NEW.user_id IS DISTINCT FROM OLD.user_id THEN
        RAISE EXCEPTION
            'Budget-limit ownership cannot be changed.';
    END IF;

    IF TG_OP = 'UPDATE'
        AND NEW.budget_id IS DISTINCT FROM OLD.budget_id THEN
        RAISE EXCEPTION
            'A budget limit cannot be moved to another budget.';
    END IF;

    SELECT b.status
    INTO v_budget_status
    FROM finance.budgets b
    WHERE b.id = NEW.budget_id
      AND b.user_id = NEW.user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION
            'The selected budget does not belong to the user.';
    END IF;

    IF v_budget_status <> 'ACTIVE' THEN
        RAISE EXCEPTION
            'Archived budgets cannot be modified.';
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

    IF v_category_type <> 'EXPENSE' THEN
        RAISE EXCEPTION
            'Budgets may only be assigned to expense categories.';
    END IF;

    IF (
           TG_OP = 'INSERT'
               OR NEW.category_id IS DISTINCT FROM OLD.category_id
           )
        AND v_category_status <> 'ACTIVE' THEN
        RAISE EXCEPTION
            'New budget limits cannot use archived categories.';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_budget_category_limit
    BEFORE INSERT OR UPDATE
    ON finance.budget_category_limits
    FOR EACH ROW
EXECUTE FUNCTION finance.validate_budget_category_limit();

REVOKE ALL
    ON FUNCTION finance.validate_budget_category_limit()
    FROM PUBLIC;

RESET ROLE;
