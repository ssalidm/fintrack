SET ROLE fintrack_owner;

-- =========================================================
-- Composite ownership keys
-- =========================================================

ALTER TABLE finance.accounts
    ADD CONSTRAINT uq_accounts_id_user
        UNIQUE (id, user_id);

ALTER TABLE finance.categories
    ADD CONSTRAINT uq_categories_id_user
        UNIQUE (id, user_id);

-- =========================================================
-- Transfers
-- =========================================================

CREATE TABLE finance.transfers
(
    id                     UUID           NOT NULL DEFAULT gen_random_uuid(),
    user_id                UUID           NOT NULL,
    source_account_id      UUID           NOT NULL,
    destination_account_id UUID           NOT NULL,
    amount                 NUMERIC(19, 4) NOT NULL,
    transaction_date       DATE           NOT NULL,
    description            VARCHAR(500),
    status                 VARCHAR(16)    NOT NULL DEFAULT 'POSTED',
    voided_at              TIMESTAMPTZ(6),
    void_reason            VARCHAR(255),
    created_at             TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version                BIGINT         NOT NULL DEFAULT 0,

    CONSTRAINT pk_transfers
        PRIMARY KEY (id),

    CONSTRAINT uq_transfers_id_user
        UNIQUE (id, user_id),

    CONSTRAINT fk_transfers_user
        FOREIGN KEY (user_id)
            REFERENCES identity.users (id)
            ON DELETE RESTRICT,

    CONSTRAINT fk_transfers_source_account
        FOREIGN KEY (source_account_id, user_id)
            REFERENCES finance.accounts (id, user_id)
            ON DELETE RESTRICT,

    CONSTRAINT fk_transfers_destination_account
        FOREIGN KEY (destination_account_id, user_id)
            REFERENCES finance.accounts (id, user_id)
            ON DELETE RESTRICT,

    CONSTRAINT ck_transfers_accounts_different
        CHECK (source_account_id <> destination_account_id),

    CONSTRAINT ck_transfers_amount
        CHECK (amount > 0),

    CONSTRAINT ck_transfers_description_not_blank
        CHECK (
            description IS NULL
                OR btrim(description) <> ''
            ),

    CONSTRAINT ck_transfers_status
        CHECK (
            status IN (
                       'POSTED',
                       'VOIDED'
                )
            ),

    CONSTRAINT ck_transfers_void_state
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

    CONSTRAINT ck_transfers_voided_after_creation
        CHECK (
            voided_at IS NULL
                OR voided_at >= created_at
            ),

    CONSTRAINT ck_transfers_updated_after_creation
        CHECK (updated_at >= created_at),

    CONSTRAINT ck_transfers_version
        CHECK (version >= 0)
);

CREATE INDEX ix_transfers_user_date
    ON finance.transfers
        (
         user_id,
         transaction_date DESC,
         created_at DESC
            );

CREATE INDEX ix_transfers_source_account
    ON finance.transfers
        (
         source_account_id,
         transaction_date DESC
            );

CREATE INDEX ix_transfers_destination_account
    ON finance.transfers
        (
         destination_account_id,
         transaction_date DESC
            );

-- =========================================================
-- Transactions
-- =========================================================

CREATE TABLE finance.transactions
(
    id               UUID           NOT NULL DEFAULT gen_random_uuid(),
    user_id          UUID           NOT NULL,
    account_id       UUID           NOT NULL,
    category_id      UUID,
    transfer_id      UUID,
    transaction_type VARCHAR(20)    NOT NULL,
    amount           NUMERIC(19, 4) NOT NULL,
    transaction_date DATE           NOT NULL,
    description      VARCHAR(500),
    merchant_name    VARCHAR(200),
    status           VARCHAR(16)    NOT NULL DEFAULT 'POSTED',
    voided_at        TIMESTAMPTZ(6),
    void_reason      VARCHAR(255),
    created_at       TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version          BIGINT         NOT NULL DEFAULT 0,

    CONSTRAINT pk_transactions
        PRIMARY KEY (id),

    CONSTRAINT fk_transactions_user
        FOREIGN KEY (user_id)
            REFERENCES identity.users (id)
            ON DELETE RESTRICT,

    CONSTRAINT fk_transactions_account
        FOREIGN KEY (account_id, user_id)
            REFERENCES finance.accounts (id, user_id)
            ON DELETE RESTRICT,

    CONSTRAINT fk_transactions_category
        FOREIGN KEY (category_id, user_id)
            REFERENCES finance.categories (id, user_id)
            ON DELETE RESTRICT,

    CONSTRAINT fk_transactions_transfer
        FOREIGN KEY (transfer_id, user_id)
            REFERENCES finance.transfers (id, user_id)
            ON DELETE RESTRICT,

    CONSTRAINT ck_transactions_type
        CHECK (
            transaction_type IN (
                                 'INCOME',
                                 'EXPENSE',
                                 'TRANSFER_IN',
                                 'TRANSFER_OUT'
                )
            ),

    CONSTRAINT ck_transactions_amount
        CHECK (amount > 0),

    CONSTRAINT ck_transactions_description_not_blank
        CHECK (
            description IS NULL
                OR btrim(description) <> ''
            ),

    CONSTRAINT ck_transactions_merchant_not_blank
        CHECK (
            merchant_name IS NULL
                OR btrim(merchant_name) <> ''
            ),

    CONSTRAINT ck_transactions_category_transfer_shape
        CHECK (
            (
                transaction_type IN ('INCOME', 'EXPENSE')
                    AND category_id IS NOT NULL
                    AND transfer_id IS NULL
                )
                OR
            (
                transaction_type IN ('TRANSFER_IN', 'TRANSFER_OUT')
                    AND category_id IS NULL
                    AND transfer_id IS NOT NULL
                )
            ),

    CONSTRAINT ck_transactions_status
        CHECK (
            status IN (
                       'POSTED',
                       'VOIDED'
                )
            ),

    CONSTRAINT ck_transactions_void_state
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

    CONSTRAINT ck_transactions_voided_after_creation
        CHECK (
            voided_at IS NULL
                OR voided_at >= created_at
            ),

    CONSTRAINT ck_transactions_updated_after_creation
        CHECK (updated_at >= created_at),

    CONSTRAINT ck_transactions_version
        CHECK (version >= 0)
);

-- A transfer may have at most one outgoing transaction.
CREATE UNIQUE INDEX uq_transactions_transfer_out
    ON finance.transactions (transfer_id)
    WHERE transaction_type = 'TRANSFER_OUT';

-- A transfer may have at most one incoming transaction.
CREATE UNIQUE INDEX uq_transactions_transfer_in
    ON finance.transactions (transfer_id)
    WHERE transaction_type = 'TRANSFER_IN';

CREATE INDEX ix_transactions_user_date
    ON finance.transactions
        (
         user_id,
         transaction_date DESC,
         created_at DESC
            );

CREATE INDEX ix_transactions_account_date
    ON finance.transactions
        (
         account_id,
         transaction_date DESC,
         created_at DESC
            );

CREATE INDEX ix_transactions_category_date
    ON finance.transactions
        (
         category_id,
         transaction_date DESC
            )
    WHERE category_id IS NOT NULL;

CREATE INDEX ix_transactions_transfer
    ON finance.transactions (transfer_id)
    WHERE transfer_id IS NOT NULL;

CREATE INDEX ix_transactions_posted_account
    ON finance.transactions
        (
         account_id,
         transaction_type,
         transaction_date
            )
    INCLUDE (amount)
    WHERE status = 'POSTED';

RESET ROLE;
