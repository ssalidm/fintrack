SET ROLE fintrack_owner;

CREATE TABLE identity.user_mfa
(
    user_id                UUID           NOT NULL,
    status                 VARCHAR(16)    NOT NULL,
    totp_secret_ciphertext BYTEA          NOT NULL,
    totp_secret_iv         BYTEA          NOT NULL,
    last_used_time_step    BIGINT,
    enabled_at             TIMESTAMPTZ(6),
    failed_attempt_count   SMALLINT       NOT NULL DEFAULT 0,
    locked_until           TIMESTAMPTZ(6),
    created_at             TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version                BIGINT         NOT NULL DEFAULT 0,

    CONSTRAINT pk_user_mfa
        PRIMARY KEY (user_id),

    CONSTRAINT fk_user_mfa_user
        FOREIGN KEY (user_id)
            REFERENCES identity.users (id)
            ON DELETE CASCADE,

    CONSTRAINT ck_user_mfa_status
        CHECK (status IN ('PENDING', 'ENABLED')),

    CONSTRAINT ck_user_mfa_failed_attempt_count
        CHECK (failed_attempt_count >= 0),

    CONSTRAINT ck_user_mfa_version
        CHECK (version >= 0),

    CONSTRAINT ck_user_mfa_updated_at
        CHECK (updated_at >= created_at)
);

CREATE TABLE identity.mfa_recovery_codes
(
    id         UUID           NOT NULL DEFAULT gen_random_uuid(),
    user_id    UUID           NOT NULL,
    code_hash  VARCHAR(64)    NOT NULL,
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    used_at    TIMESTAMPTZ(6),

    CONSTRAINT pk_mfa_recovery_codes
        PRIMARY KEY (id),

    CONSTRAINT uq_mfa_recovery_codes_user_hash
        UNIQUE (user_id, code_hash),

    CONSTRAINT fk_mfa_recovery_codes_user
        FOREIGN KEY (user_id)
            REFERENCES identity.users (id)
            ON DELETE CASCADE,

    CONSTRAINT ck_mfa_recovery_codes_hash
        CHECK (code_hash ~ '^[0-9a-f]{64}$'),

    CONSTRAINT ck_mfa_recovery_codes_used_at
        CHECK (
            used_at IS NULL
                OR used_at >= created_at
            )
);

CREATE INDEX ix_mfa_recovery_codes_user_usable
    ON identity.mfa_recovery_codes (user_id)
    WHERE used_at IS NULL;

CREATE TABLE identity.mfa_login_challenges
(
    id             UUID           NOT NULL DEFAULT gen_random_uuid(),
    user_id        UUID           NOT NULL,
    token_hash     VARCHAR(64)    NOT NULL,
    user_agent     VARCHAR(512),
    attempt_count  SMALLINT       NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at     TIMESTAMPTZ(6) NOT NULL,
    consumed_at    TIMESTAMPTZ(6),
    invalidated_at TIMESTAMPTZ(6),

    CONSTRAINT pk_mfa_login_challenges
        PRIMARY KEY (id),

    CONSTRAINT uq_mfa_login_challenges_hash
        UNIQUE (token_hash),

    CONSTRAINT fk_mfa_login_challenges_user
        FOREIGN KEY (user_id)
            REFERENCES identity.users (id)
            ON DELETE CASCADE,

    CONSTRAINT ck_mfa_login_challenges_hash
        CHECK (token_hash ~ '^[0-9a-f]{64}$'),

    CONSTRAINT ck_mfa_login_challenges_attempt_count
        CHECK (attempt_count >= 0),

    CONSTRAINT ck_mfa_login_challenges_expiry
        CHECK (expires_at > created_at),

    CONSTRAINT ck_mfa_login_challenges_consumed
        CHECK (
            consumed_at IS NULL
                OR consumed_at >= created_at
            ),

    CONSTRAINT ck_mfa_login_challenges_invalidated
        CHECK (
            invalidated_at IS NULL
                OR invalidated_at >= created_at
            ),

    CONSTRAINT ck_mfa_login_challenges_single_outcome
        CHECK (
            NOT (
                consumed_at IS NOT NULL
                    AND invalidated_at IS NOT NULL
                )
            )
);

CREATE INDEX ix_mfa_login_challenges_active_user
    ON identity.mfa_login_challenges (user_id)
    WHERE consumed_at IS NULL
        AND invalidated_at IS NULL;

RESET ROLE;
