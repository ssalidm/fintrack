SET ROLE fintrack_owner;

-- =========================================================
-- User multi-factor authentication configuration
-- =========================================================

CREATE TABLE identity.user_mfa
(
    user_id                UUID PRIMARY KEY,
    status                 VARCHAR(16)  NOT NULL,

    totp_secret_ciphertext BYTEA        NOT NULL,
    totp_secret_iv         BYTEA        NOT NULL,

    last_used_time_step    BIGINT,

    enabled_at             TIMESTAMPTZ,
    created_at             TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version                BIGINT       NOT NULL DEFAULT 0,

    CONSTRAINT fk_user_mfa_user
        FOREIGN KEY (user_id)
            REFERENCES identity.users (id)
            ON DELETE CASCADE,

    CONSTRAINT ck_user_mfa_status
        CHECK (status IN ('PENDING', 'ENABLED')),

    CONSTRAINT ck_user_mfa_enabled_state
        CHECK (
            (status = 'PENDING' AND enabled_at IS NULL)
                OR
            (status = 'ENABLED' AND enabled_at IS NOT NULL)
            ),

    CONSTRAINT ck_user_mfa_updated_after_created
        CHECK (updated_at >= created_at),

    CONSTRAINT ck_user_mfa_version
        CHECK (version >= 0),

    CONSTRAINT ck_user_mfa_last_used_time_step
        CHECK (
            last_used_time_step IS NULL
                OR last_used_time_step >= 0
            )
);


-- =========================================================
-- MFA recovery codes
--
-- Raw recovery codes are never stored.
-- Only their hashes are persisted.
-- =========================================================

CREATE TABLE identity.mfa_recovery_codes
(
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID        NOT NULL,
    code_hash  VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    used_at    TIMESTAMPTZ,

    CONSTRAINT fk_mfa_recovery_codes_user
        FOREIGN KEY (user_id)
            REFERENCES identity.users (id)
            ON DELETE CASCADE,

    CONSTRAINT uq_mfa_recovery_codes_user_hash
        UNIQUE (user_id, code_hash),

    CONSTRAINT ck_mfa_recovery_codes_used_after_created
        CHECK (
            used_at IS NULL
                OR used_at >= created_at
            )
);

CREATE INDEX ix_mfa_recovery_codes_active_user
    ON identity.mfa_recovery_codes (user_id)
    WHERE used_at IS NULL;


-- =========================================================
-- MFA login challenges
--
-- A successful password check for a user with MFA enabled
-- produces a short-lived opaque challenge token.
--
-- Only the token hash is stored.
-- =========================================================

CREATE TABLE identity.mfa_login_challenges
(
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID         NOT NULL,
    token_hash     VARCHAR(64)  NOT NULL,
    user_agent     VARCHAR(512),

    attempt_count  SMALLINT     NOT NULL DEFAULT 0,

    created_at     TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at     TIMESTAMPTZ  NOT NULL,
    consumed_at    TIMESTAMPTZ,
    invalidated_at TIMESTAMPTZ,

    CONSTRAINT fk_mfa_login_challenges_user
        FOREIGN KEY (user_id)
            REFERENCES identity.users (id)
            ON DELETE CASCADE,

    CONSTRAINT uq_mfa_login_challenges_token_hash
        UNIQUE (token_hash),

    CONSTRAINT ck_mfa_login_challenges_attempt_count
        CHECK (attempt_count >= 0),

    CONSTRAINT ck_mfa_login_challenges_expiry
        CHECK (expires_at > created_at),

    CONSTRAINT ck_mfa_login_challenges_consumed_after_created
        CHECK (
            consumed_at IS NULL
                OR consumed_at >= created_at
            ),

    CONSTRAINT ck_mfa_login_challenges_invalidated_after_created
        CHECK (
            invalidated_at IS NULL
                OR invalidated_at >= created_at
            ),

    CONSTRAINT ck_mfa_login_challenges_terminal_state
        CHECK (
            consumed_at IS NULL
                OR invalidated_at IS NULL
            )
);

CREATE INDEX ix_mfa_login_challenges_user
    ON identity.mfa_login_challenges (
                                      user_id,
                                      created_at DESC
        );

CREATE INDEX ix_mfa_login_challenges_active_user
    ON identity.mfa_login_challenges (user_id)
    WHERE consumed_at IS NULL
        AND invalidated_at IS NULL;


RESET ROLE;
