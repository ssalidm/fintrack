SET ROLE fintrack_owner;

-- =========================================================
-- Savings goals
-- =========================================================

CREATE TABLE finance.savings_goals
(
    id            UUID           NOT NULL DEFAULT gen_random_uuid(),
    user_id       UUID           NOT NULL,
    name          VARCHAR(100)   NOT NULL,
    description   VARCHAR(500),
    currency_code VARCHAR(3)     NOT NULL,
    target_amount NUMERIC(19, 4) NOT NULL,
    target_date   DATE,
    status        VARCHAR(16)    NOT NULL DEFAULT 'ACTIVE',
    completed_at  TIMESTAMPTZ(6),
    archived_at   TIMESTAMPTZ(6),
    created_at    TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version       BIGINT         NOT NULL DEFAULT 0,

    CONSTRAINT pk_savings_goals
        PRIMARY KEY (id),

    CONSTRAINT uq_savings_goals_id_user
        UNIQUE (id, user_id),

    CONSTRAINT fk_savings_goals_user
        FOREIGN KEY (user_id)
            REFERENCES identity.users (id)
            ON DELETE RESTRICT,

    CONSTRAINT fk_savings_goals_currency
        FOREIGN KEY (currency_code)
            REFERENCES finance.currencies (code)
            ON UPDATE RESTRICT
            ON DELETE RESTRICT,

    CONSTRAINT ck_savings_goals_name_not_blank
        CHECK (btrim(name) <> ''),

    CONSTRAINT ck_savings_goals_description
        CHECK (
            description IS NULL
                OR btrim(description) <> ''
            ),

    CONSTRAINT ck_savings_goals_target_amount
        CHECK (target_amount > 0),

    CONSTRAINT ck_savings_goals_status
        CHECK (
            status IN (
                       'ACTIVE',
                       'COMPLETED',
                       'ARCHIVED'
                )
            ),

    CONSTRAINT ck_savings_goals_state
        CHECK (
            (
                status = 'ACTIVE'
                    AND completed_at IS NULL
                    AND archived_at IS NULL
                )
                OR
            (
                status = 'COMPLETED'
                    AND completed_at IS NOT NULL
                    AND archived_at IS NULL
                )
                OR
            (
                status = 'ARCHIVED'
                    AND archived_at IS NOT NULL
                )
            ),

    CONSTRAINT ck_savings_goals_completed_after_creation
        CHECK (
            completed_at IS NULL
                OR completed_at >= created_at
            ),

    CONSTRAINT ck_savings_goals_archived_after_creation
        CHECK (
            archived_at IS NULL
                OR archived_at >= created_at
            ),

    CONSTRAINT ck_savings_goals_updated_after_creation
        CHECK (updated_at >= created_at),

    CONSTRAINT ck_savings_goals_version
        CHECK (version >= 0)
);

-- Archived names may be reused, but active/completed goal names must be
-- unique for the user, ignoring surrounding whitespace and letter case.
CREATE UNIQUE INDEX uq_savings_goals_open_user_name
    ON finance.savings_goals
        (
         user_id,
         lower(btrim(name))
            )
    WHERE status IN (
                     'ACTIVE',
                     'COMPLETED'
        );

CREATE INDEX ix_savings_goals_user_status
    ON finance.savings_goals
        (
         user_id,
         status,
         target_date
            );

-- =========================================================
-- Goal-contribution history
-- =========================================================

CREATE TABLE finance.goal_contributions
(
    id                UUID           NOT NULL DEFAULT gen_random_uuid(),
    goal_id           UUID           NOT NULL,
    user_id           UUID           NOT NULL,
    amount            NUMERIC(19, 4) NOT NULL,
    contribution_date DATE           NOT NULL,
    note              VARCHAR(500),
    status            VARCHAR(16)    NOT NULL DEFAULT 'POSTED',
    voided_at         TIMESTAMPTZ(6),
    void_reason       VARCHAR(255),
    created_at        TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version           BIGINT         NOT NULL DEFAULT 0,

    CONSTRAINT pk_goal_contributions
        PRIMARY KEY (id),

    CONSTRAINT fk_goal_contributions_goal
        FOREIGN KEY (goal_id, user_id)
            REFERENCES finance.savings_goals (id, user_id)
            ON DELETE RESTRICT,

    CONSTRAINT ck_goal_contributions_amount
        CHECK (amount > 0),

    CONSTRAINT ck_goal_contributions_note
        CHECK (
            note IS NULL
                OR btrim(note) <> ''
            ),

    CONSTRAINT ck_goal_contributions_status
        CHECK (
            status IN (
                       'POSTED',
                       'VOIDED'
                )
            ),

    CONSTRAINT ck_goal_contributions_void_state
        CHECK (
            (
                status = 'POSTED'
                    AND voided_at IS NULL
                    AND void_reason IS NULL
                )
                OR
            (
                status = 'VOIDED'
                    AND voided_at IS NOT NULL
                    AND void_reason IS NOT NULL
                    AND btrim(void_reason) <> ''
                )
            ),

    CONSTRAINT ck_goal_contributions_voided_after_creation
        CHECK (
            voided_at IS NULL
                OR voided_at >= created_at
            ),

    CONSTRAINT ck_goal_contributions_updated_after_creation
        CHECK (updated_at >= created_at),

    CONSTRAINT ck_goal_contributions_version
        CHECK (version >= 0)
);

CREATE INDEX ix_goal_contributions_goal_date
    ON finance.goal_contributions
        (
         goal_id,
         contribution_date DESC,
         created_at DESC
            );

CREATE INDEX ix_goal_contributions_posted_goal
    ON finance.goal_contributions
        (
         goal_id,
         contribution_date
            )
    INCLUDE (amount)
    WHERE status = 'POSTED';

-- =========================================================
-- Goal-contribution validation
-- =========================================================

CREATE OR REPLACE FUNCTION finance.validate_goal_contribution()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SET search_path = pg_catalog
AS
$$
DECLARE
    v_goal_status VARCHAR(16);
BEGIN
    IF TG_OP = 'UPDATE'
        AND NEW.user_id IS DISTINCT FROM OLD.user_id THEN
        RAISE EXCEPTION
            'Contribution ownership cannot be changed.';
    END IF;

    IF TG_OP = 'UPDATE'
        AND NEW.goal_id IS DISTINCT FROM OLD.goal_id THEN
        RAISE EXCEPTION
            'A contribution cannot be moved to another goal.';
    END IF;

    IF TG_OP = 'UPDATE'
        AND OLD.status = 'VOIDED'
        AND NEW.status = 'POSTED' THEN
        RAISE EXCEPTION
            'A voided contribution cannot be restored.';
    END IF;

    SELECT g.status
    INTO v_goal_status
    FROM finance.savings_goals g
    WHERE g.id = NEW.goal_id
      AND g.user_id = NEW.user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION
            'The selected savings goal does not belong to the user.';
    END IF;

    IF TG_OP = 'INSERT'
        AND v_goal_status <> 'ACTIVE' THEN
        RAISE EXCEPTION
            'Contributions may only be added to active goals.';
    END IF;

    IF TG_OP = 'UPDATE'
        AND (
           NEW.amount IS DISTINCT FROM OLD.amount
               OR NEW.contribution_date IS DISTINCT FROM OLD.contribution_date
           )
        AND v_goal_status <> 'ACTIVE' THEN
        RAISE EXCEPTION
            'Completed or archived goal contributions cannot be changed.';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_goal_contribution
    BEFORE INSERT OR UPDATE
    ON finance.goal_contributions
    FOR EACH ROW
EXECUTE FUNCTION finance.validate_goal_contribution();

REVOKE ALL
    ON FUNCTION finance.validate_goal_contribution()
    FROM PUBLIC;

RESET ROLE;
