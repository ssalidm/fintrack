SET ROLE fintrack_owner;

-- =========================================================
-- Transaction validation trigger
-- =========================================================

CREATE OR REPLACE FUNCTION finance.validate_transaction_write()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SET search_path = pg_catalog
AS
$$
DECLARE
    v_account_status              VARCHAR(16);
    v_category_type               VARCHAR(20);
    v_category_status             VARCHAR(16);
    v_transfer_source_account_id  UUID;
    v_transfer_destination_id     UUID;
    v_transfer_amount             NUMERIC(19, 4);
    v_transfer_date               DATE;
    v_transfer_status             VARCHAR(16);
BEGIN
    IF TG_OP = 'UPDATE'
        AND NEW.user_id IS DISTINCT FROM OLD.user_id THEN
        RAISE EXCEPTION
            'Transaction ownership cannot be changed.';
    END IF;

    SELECT a.status
    INTO v_account_status
    FROM finance.accounts a
    WHERE a.id = NEW.account_id
      AND a.user_id = NEW.user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION
            'The selected account does not belong to the transaction user.';
    END IF;

    IF (
           TG_OP = 'INSERT'
               OR NEW.account_id IS DISTINCT FROM OLD.account_id
           )
        AND v_account_status <> 'ACTIVE' THEN
        RAISE EXCEPTION
            'New transactions cannot be posted to an archived account.';
    END IF;

    IF NEW.transaction_type IN ('INCOME', 'EXPENSE') THEN
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
                'The selected category does not belong to the transaction user.';
        END IF;

        IF v_category_type <> NEW.transaction_type THEN
            RAISE EXCEPTION
                'Transaction type % requires a % category.',
                NEW.transaction_type,
                NEW.transaction_type;
        END IF;

        IF (
               TG_OP = 'INSERT'
                   OR NEW.category_id IS DISTINCT FROM OLD.category_id
               )
            AND v_category_status <> 'ACTIVE' THEN
            RAISE EXCEPTION
                'New transactions cannot use an archived category.';
        END IF;
    ELSE
        -- Transfer legs must be created through the controlled
        -- SECURITY DEFINER transfer function.
        IF current_user <> 'fintrack_owner' THEN
            RAISE EXCEPTION
                'Transfer transactions must be created through finance.create_transfer.';
        END IF;

        SELECT
            tr.source_account_id,
            tr.destination_account_id,
            tr.amount,
            tr.transaction_date,
            tr.status
        INTO
            v_transfer_source_account_id,
            v_transfer_destination_id,
            v_transfer_amount,
            v_transfer_date,
            v_transfer_status
        FROM finance.transfers tr
        WHERE tr.id = NEW.transfer_id
          AND tr.user_id = NEW.user_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION
                'The referenced transfer does not exist for this user.';
        END IF;

        IF NEW.transaction_type = 'TRANSFER_OUT'
            AND NEW.account_id <> v_transfer_source_account_id THEN
            RAISE EXCEPTION
                'TRANSFER_OUT must use the transfer source account.';
        END IF;

        IF NEW.transaction_type = 'TRANSFER_IN'
            AND NEW.account_id <> v_transfer_destination_id THEN
            RAISE EXCEPTION
                'TRANSFER_IN must use the transfer destination account.';
        END IF;

        IF NEW.amount <> v_transfer_amount THEN
            RAISE EXCEPTION
                'Transfer transaction amount must equal the transfer amount.';
        END IF;

        IF NEW.transaction_date <> v_transfer_date THEN
            RAISE EXCEPTION
                'Transfer transaction date must equal the transfer date.';
        END IF;

        IF NEW.status <> v_transfer_status THEN
            RAISE EXCEPTION
                'Transfer transaction status must match the transfer status.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_transaction_write
    BEFORE INSERT OR UPDATE
    ON finance.transactions
    FOR EACH ROW
EXECUTE FUNCTION finance.validate_transaction_write();

-- =========================================================
-- Atomic transfer creation
-- =========================================================

CREATE OR REPLACE FUNCTION finance.create_transfer
(
    p_user_id                UUID,
    p_source_account_id      UUID,
    p_destination_account_id UUID,
    p_amount                 NUMERIC,
    p_transaction_date       DATE,
    p_description            VARCHAR DEFAULT NULL
)
    RETURNS UUID
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = pg_catalog
AS
$$
DECLARE
    v_transfer_id          UUID;
    v_source_status        VARCHAR(16);
    v_destination_status   VARCHAR(16);
    v_source_currency      VARCHAR(3);
    v_destination_currency VARCHAR(3);
BEGIN
    IF p_user_id IS NULL THEN
        RAISE EXCEPTION 'User ID is required.';
    END IF;

    IF p_source_account_id IS NULL
        OR p_destination_account_id IS NULL THEN
        RAISE EXCEPTION 'Source and destination accounts are required.';
    END IF;

    IF p_source_account_id = p_destination_account_id THEN
        RAISE EXCEPTION
            'Source and destination accounts must be different.';
    END IF;

    IF p_amount IS NULL OR p_amount <= 0 THEN
        RAISE EXCEPTION
            'Transfer amount must be greater than zero.';
    END IF;

    IF p_transaction_date IS NULL THEN
        RAISE EXCEPTION
            'Transaction date is required.';
    END IF;

    -- Lock both account rows in a deterministic order.
    -- This prevents account state changes while the transfer is created
    -- and reduces deadlock risk.
    PERFORM 1
    FROM finance.accounts a
    WHERE a.user_id = p_user_id
      AND a.id IN (
                   p_source_account_id,
                   p_destination_account_id
        )
    ORDER BY a.id
        FOR SHARE;

    SELECT
        a.status,
        a.currency_code
    INTO
        v_source_status,
        v_source_currency
    FROM finance.accounts a
    WHERE a.id = p_source_account_id
      AND a.user_id = p_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION
            'Source account does not exist or does not belong to the user.';
    END IF;

    SELECT
        a.status,
        a.currency_code
    INTO
        v_destination_status,
        v_destination_currency
    FROM finance.accounts a
    WHERE a.id = p_destination_account_id
      AND a.user_id = p_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION
            'Destination account does not exist or does not belong to the user.';
    END IF;

    IF v_source_status <> 'ACTIVE'
        OR v_destination_status <> 'ACTIVE' THEN
        RAISE EXCEPTION
            'Transfers require two active accounts.';
    END IF;

    IF v_source_currency <> v_destination_currency THEN
        RAISE EXCEPTION
            'Transfers between different currencies are not supported.';
    END IF;

    INSERT INTO finance.transfers
    (
        user_id,
        source_account_id,
        destination_account_id,
        amount,
        transaction_date,
        description
    )
    VALUES
        (
            p_user_id,
            p_source_account_id,
            p_destination_account_id,
            p_amount,
            p_transaction_date,
            NULLIF(btrim(p_description), '')
        )
    RETURNING id
        INTO v_transfer_id;

    INSERT INTO finance.transactions
    (
        user_id,
        account_id,
        transfer_id,
        transaction_type,
        amount,
        transaction_date,
        description
    )
    VALUES
        (
            p_user_id,
            p_source_account_id,
            v_transfer_id,
            'TRANSFER_OUT',
            p_amount,
            p_transaction_date,
            NULLIF(btrim(p_description), '')
        );

    INSERT INTO finance.transactions
    (
        user_id,
        account_id,
        transfer_id,
        transaction_type,
        amount,
        transaction_date,
        description
    )
    VALUES
        (
            p_user_id,
            p_destination_account_id,
            v_transfer_id,
            'TRANSFER_IN',
            p_amount,
            p_transaction_date,
            NULLIF(btrim(p_description), '')
        );

    RETURN v_transfer_id;
END;
$$;

-- =========================================================
-- Atomic transfer voiding
-- =========================================================

CREATE OR REPLACE FUNCTION finance.void_transfer
(
    p_user_id     UUID,
    p_transfer_id UUID,
    p_reason      VARCHAR
)
    RETURNS UUID
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = pg_catalog
AS
$$
DECLARE
    v_transfer_status VARCHAR(16);
    v_voided_at       TIMESTAMPTZ(6);
    v_updated_count   INTEGER;
BEGIN
    IF p_reason IS NULL OR btrim(p_reason) = '' THEN
        RAISE EXCEPTION
            'A reason is required when voiding a transfer.';
    END IF;

    SELECT tr.status
    INTO v_transfer_status
    FROM finance.transfers tr
    WHERE tr.id = p_transfer_id
      AND tr.user_id = p_user_id
        FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION
            'Transfer does not exist or does not belong to the user.';
    END IF;

    IF v_transfer_status = 'VOIDED' THEN
        RETURN p_transfer_id;
    END IF;

    v_voided_at := CURRENT_TIMESTAMP;

    UPDATE finance.transfers
    SET
        status = 'VOIDED',
        voided_at = v_voided_at,
        void_reason = btrim(p_reason),
        updated_at = v_voided_at,
        version = version + 1
    WHERE id = p_transfer_id
      AND user_id = p_user_id;

    UPDATE finance.transactions
    SET
        status = 'VOIDED',
        voided_at = v_voided_at,
        void_reason = btrim(p_reason),
        updated_at = v_voided_at,
        version = version + 1
    WHERE transfer_id = p_transfer_id
      AND user_id = p_user_id;

    GET DIAGNOSTICS v_updated_count = ROW_COUNT;

    IF v_updated_count <> 2 THEN
        RAISE EXCEPTION
            'Transfer integrity error: expected two transaction legs but found %.',
            v_updated_count;
    END IF;

    RETURN p_transfer_id;
END;
$$;

-- =========================================================
-- Function permissions
-- =========================================================

REVOKE ALL
    ON FUNCTION finance.validate_transaction_write()
    FROM PUBLIC;

REVOKE ALL
    ON FUNCTION finance.create_transfer
    (
        UUID,
        UUID,
        UUID,
        NUMERIC,
        DATE,
        VARCHAR
        )
    FROM PUBLIC;

REVOKE ALL
    ON FUNCTION finance.void_transfer
    (
        UUID,
        UUID,
        VARCHAR
        )
    FROM PUBLIC;

GRANT EXECUTE
    ON FUNCTION finance.create_transfer
    (
        UUID,
        UUID,
        UUID,
        NUMERIC,
        DATE,
        VARCHAR
        )
    TO fintrack_application;

GRANT EXECUTE
    ON FUNCTION finance.void_transfer
    (
        UUID,
        UUID,
        VARCHAR
        )
    TO fintrack_application;

-- The application may read transfers but must create and void them
-- only through the controlled functions.
REVOKE INSERT, UPDATE
    ON TABLE finance.transfers
    FROM fintrack_application;

GRANT SELECT
    ON TABLE finance.transfers
    TO fintrack_application;

RESET ROLE;
