SET ROLE fintrack_owner;

CREATE TABLE identity.email_verification_tokens
(
    id             UUID           NOT NULL DEFAULT gen_random_uuid(),
    user_id        UUID           NOT NULL,
    token_hash     VARCHAR(64)    NOT NULL,
    created_at     TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at     TIMESTAMPTZ(6) NOT NULL,
    consumed_at    TIMESTAMPTZ(6),
    invalidated_at TIMESTAMPTZ(6),
    requested_ip   INET,

    CONSTRAINT pk_email_verification_tokens
        PRIMARY KEY (id),

    CONSTRAINT uq_email_verification_tokens_hash
        UNIQUE (token_hash),

    CONSTRAINT fk_email_verification_tokens_user
        FOREIGN KEY (user_id)
            REFERENCES identity.users (id)
            ON DELETE CASCADE,

    CONSTRAINT ck_email_verification_tokens_hash
        CHECK (token_hash ~ '^[0-9a-f]{64}$'),

    CONSTRAINT ck_email_verification_tokens_expiry
        CHECK (expires_at > created_at),

    CONSTRAINT ck_email_verification_tokens_consumed
        CHECK (
            consumed_at IS NULL
                OR consumed_at >= created_at
            ),

    CONSTRAINT ck_email_verification_tokens_invalidated
        CHECK (
            invalidated_at IS NULL
                OR invalidated_at >= created_at
            ),

    CONSTRAINT ck_email_verification_tokens_single_outcome
        CHECK (
            NOT (
                consumed_at IS NOT NULL
                    AND invalidated_at IS NOT NULL
                )
            )
);

CREATE UNIQUE INDEX uq_email_verification_tokens_active_user
    ON identity.email_verification_tokens (user_id)
    WHERE consumed_at IS NULL
        AND invalidated_at IS NULL;

CREATE TABLE identity.password_reset_tokens
(
    id             UUID           NOT NULL DEFAULT gen_random_uuid(),
    user_id        UUID           NOT NULL,
    token_hash     VARCHAR(64)    NOT NULL,
    created_at     TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at     TIMESTAMPTZ(6) NOT NULL,
    consumed_at    TIMESTAMPTZ(6),
    invalidated_at TIMESTAMPTZ(6),
    requested_ip   INET,

    CONSTRAINT pk_password_reset_tokens
        PRIMARY KEY (id),

    CONSTRAINT uq_password_reset_tokens_hash
        UNIQUE (token_hash),

    CONSTRAINT fk_password_reset_tokens_user
        FOREIGN KEY (user_id)
            REFERENCES identity.users (id)
            ON DELETE CASCADE,

    CONSTRAINT ck_password_reset_tokens_hash
        CHECK (token_hash ~ '^[0-9a-f]{64}$'),

    CONSTRAINT ck_password_reset_tokens_expiry
        CHECK (expires_at > created_at),

    CONSTRAINT ck_password_reset_tokens_consumed
        CHECK (
            consumed_at IS NULL
                OR consumed_at >= created_at
            ),

    CONSTRAINT ck_password_reset_tokens_invalidated
        CHECK (
            invalidated_at IS NULL
                OR invalidated_at >= created_at
            ),

    CONSTRAINT ck_password_reset_tokens_single_outcome
        CHECK (
            NOT (
                consumed_at IS NOT NULL
                    AND invalidated_at IS NOT NULL
                )
            )
);

CREATE UNIQUE INDEX uq_password_reset_tokens_active_user
    ON identity.password_reset_tokens (user_id)
    WHERE consumed_at IS NULL
        AND invalidated_at IS NULL;

RESET ROLE;
