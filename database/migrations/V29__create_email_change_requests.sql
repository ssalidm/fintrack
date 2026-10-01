SET ROLE fintrack_owner;

CREATE TABLE identity.email_change_requests
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES identity.users (id)
            ON DELETE CASCADE,

    current_email VARCHAR(320) NOT NULL,
    new_email VARCHAR(320) NOT NULL,

    token_hash VARCHAR(64) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL,

    confirmed_at TIMESTAMPTZ,
    invalidated_at TIMESTAMPTZ,

    CONSTRAINT uq_email_change_requests_token_hash
        UNIQUE (token_hash),

    CONSTRAINT ck_email_change_requests_current_email_not_blank
        CHECK (btrim(current_email) <> ''),

    CONSTRAINT ck_email_change_requests_new_email_not_blank
        CHECK (btrim(new_email) <> ''),

    CONSTRAINT ck_email_change_requests_email_changed
        CHECK (
            lower(btrim(current_email))
                <> lower(btrim(new_email))
            ),

    CONSTRAINT ck_email_change_requests_expiry
        CHECK (expires_at > created_at),

    CONSTRAINT ck_email_change_requests_confirmed_at
        CHECK (
            confirmed_at IS NULL
                OR confirmed_at >= created_at
            ),

    CONSTRAINT ck_email_change_requests_invalidated_at
        CHECK (
            invalidated_at IS NULL
                OR invalidated_at >= created_at
            ),

    CONSTRAINT ck_email_change_requests_single_terminal_state
        CHECK (
            confirmed_at IS NULL
                OR invalidated_at IS NULL
            )
);

CREATE UNIQUE INDEX uq_email_change_requests_active_user
    ON identity.email_change_requests (user_id)
    WHERE confirmed_at IS NULL
        AND invalidated_at IS NULL;

CREATE INDEX ix_email_change_requests_user
    ON identity.email_change_requests (user_id);

CREATE INDEX ix_email_change_requests_expires_at
    ON identity.email_change_requests (expires_at);

RESET ROLE;
