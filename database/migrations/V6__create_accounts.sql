SET ROLE fintrack_owner;

CREATE TABLE finance.accounts
(
    id                   UUID           NOT NULL DEFAULT gen_random_uuid(),
    user_id              UUID           NOT NULL,
    name                 VARCHAR(100)   NOT NULL,
    account_type         VARCHAR(32)    NOT NULL,
    currency_code        VARCHAR(3)     NOT NULL,
    opening_balance      NUMERIC(19, 4) NOT NULL DEFAULT 0,
    status               VARCHAR(16)    NOT NULL DEFAULT 'ACTIVE',
    include_in_net_worth BOOLEAN        NOT NULL DEFAULT TRUE,
    archived_at          TIMESTAMPTZ(6),
    created_at           TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version              BIGINT         NOT NULL DEFAULT 0,

    CONSTRAINT pk_accounts
        PRIMARY KEY (id),

    CONSTRAINT fk_accounts_user
        FOREIGN KEY (user_id)
            REFERENCES identity.users (id)
            ON DELETE RESTRICT,

    CONSTRAINT fk_accounts_currency
        FOREIGN KEY (currency_code)
            REFERENCES finance.currencies (code)
            ON UPDATE RESTRICT
            ON DELETE RESTRICT,

    CONSTRAINT ck_accounts_name_not_blank
        CHECK (btrim(name) <> ''),

    CONSTRAINT ck_accounts_type
        CHECK (
            account_type IN (
                             'CASH',
                             'CURRENT',
                             'SAVINGS',
                             'CREDIT_CARD',
                             'INVESTMENT',
                             'OTHER'
                )
            ),

    CONSTRAINT ck_accounts_status
        CHECK (
            status IN (
                       'ACTIVE',
                       'ARCHIVED'
                )
            ),

    CONSTRAINT ck_accounts_archive_state
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

    CONSTRAINT ck_accounts_archived_after_creation
        CHECK (
            archived_at IS NULL
                OR archived_at >= created_at
            ),

    CONSTRAINT ck_accounts_updated_after_creation
        CHECK (updated_at >= created_at),

    CONSTRAINT ck_accounts_version
        CHECK (version >= 0)
);

-- A user cannot have two active accounts whose names differ only by
-- whitespace or letter case.
CREATE UNIQUE INDEX uq_accounts_active_user_name
    ON finance.accounts
        (
         user_id,
         lower(btrim(name))
            )
    WHERE status = 'ACTIVE';

CREATE INDEX ix_accounts_user_status
    ON finance.accounts
        (
         user_id,
         status,
         created_at DESC
            );

CREATE INDEX ix_accounts_active_user_type
    ON finance.accounts
        (
         user_id,
         account_type
            )
    WHERE status = 'ACTIVE';

RESET ROLE;
