SET ROLE fintrack_owner;

CREATE TABLE identity.registration_requests
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    email VARCHAR(320) NOT NULL,

    token_hash VARCHAR(64) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL
                        DEFAULT CURRENT_TIMESTAMP,

    expires_at TIMESTAMPTZ NOT NULL,

    consumed_at TIMESTAMPTZ,

    invalidated_at TIMESTAMPTZ,

    CONSTRAINT uq_registration_requests_token_hash
        UNIQUE (token_hash),

    CONSTRAINT ck_registration_requests_email_not_blank
        CHECK (btrim(email) <> ''),

    CONSTRAINT ck_registration_requests_expiry
        CHECK (expires_at > created_at),

    CONSTRAINT ck_registration_requests_consumed_at
        CHECK (
            consumed_at IS NULL
                OR consumed_at >= created_at
            ),

    CONSTRAINT ck_registration_requests_invalidated_at
        CHECK (
            invalidated_at IS NULL
                OR invalidated_at >= created_at
            ),

    CONSTRAINT ck_registration_requests_single_terminal_state
        CHECK (
            consumed_at IS NULL
                OR invalidated_at IS NULL
            )
);

CREATE UNIQUE INDEX
    uq_registration_requests_active_email
    ON identity.registration_requests (
                                       lower(email)
        )
    WHERE consumed_at IS NULL
        AND invalidated_at IS NULL;

CREATE INDEX
    ix_registration_requests_expires_at
    ON identity.registration_requests (
                                       expires_at
        );

RESET ROLE;
