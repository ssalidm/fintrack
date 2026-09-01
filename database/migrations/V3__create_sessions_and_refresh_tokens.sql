SET ROLE fintrack_owner;

CREATE TABLE identity.auth_sessions
(
    id                UUID           NOT NULL DEFAULT gen_random_uuid(),
    user_id           UUID           NOT NULL,
    created_at        TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen_at      TIMESTAMPTZ(6),
    expires_at        TIMESTAMPTZ(6) NOT NULL,
    revoked_at        TIMESTAMPTZ(6),
    revocation_reason VARCHAR(255),
    created_by_ip     INET,
    last_seen_ip      INET,
    user_agent        VARCHAR(512),
    version           BIGINT         NOT NULL DEFAULT 0,

    CONSTRAINT pk_auth_sessions
        PRIMARY KEY (id),

    CONSTRAINT uq_auth_sessions_id_user
        UNIQUE (id, user_id),

    CONSTRAINT fk_auth_sessions_user
        FOREIGN KEY (user_id)
            REFERENCES identity.users (id)
            ON DELETE CASCADE,

    CONSTRAINT ck_auth_sessions_expiry
        CHECK (expires_at > created_at),

    CONSTRAINT ck_auth_sessions_last_seen
        CHECK (
            last_seen_at IS NULL
                OR last_seen_at >= created_at
            ),

    CONSTRAINT ck_auth_sessions_revoked_at
        CHECK (
            revoked_at IS NULL
                OR revoked_at >= created_at
            ),

    CONSTRAINT ck_auth_sessions_revocation_reason
        CHECK (
            revoked_at IS NOT NULL
                OR revocation_reason IS NULL
            ),

    CONSTRAINT ck_auth_sessions_version
        CHECK (version >= 0)
);

CREATE INDEX ix_auth_sessions_active_user
    ON identity.auth_sessions
        (
         user_id,
         expires_at DESC
            )
    WHERE revoked_at IS NULL;

CREATE TABLE identity.refresh_tokens
(
    id                   UUID           NOT NULL DEFAULT gen_random_uuid(),
    session_id           UUID           NOT NULL,
    user_id              UUID           NOT NULL,
    token_hash           VARCHAR(64)    NOT NULL,
    issued_at            TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at           TIMESTAMPTZ(6) NOT NULL,
    consumed_at          TIMESTAMPTZ(6),
    revoked_at           TIMESTAMPTZ(6),
    revocation_reason    VARCHAR(255),
    replaced_by_token_id UUID,

    CONSTRAINT pk_refresh_tokens
        PRIMARY KEY (id),

    CONSTRAINT uq_refresh_tokens_hash
        UNIQUE (token_hash),

    CONSTRAINT fk_refresh_tokens_session_user
        FOREIGN KEY (session_id, user_id)
            REFERENCES identity.auth_sessions (id, user_id)
            ON DELETE CASCADE,

    CONSTRAINT fk_refresh_tokens_replacement
        FOREIGN KEY (replaced_by_token_id)
            REFERENCES identity.refresh_tokens (id)
            ON DELETE SET NULL,

    CONSTRAINT ck_refresh_tokens_hash
        CHECK (token_hash ~ '^[0-9a-f]{64}$'),

    CONSTRAINT ck_refresh_tokens_expiry
        CHECK (expires_at > issued_at),

    CONSTRAINT ck_refresh_tokens_consumed_at
        CHECK (
            consumed_at IS NULL
                OR consumed_at >= issued_at
            ),

    CONSTRAINT ck_refresh_tokens_revoked_at
        CHECK (
            revoked_at IS NULL
                OR revoked_at >= issued_at
            ),

    CONSTRAINT ck_refresh_tokens_revocation_reason
        CHECK (
            revoked_at IS NOT NULL
                OR revocation_reason IS NULL
            ),

    CONSTRAINT ck_refresh_tokens_replacement
        CHECK (
            replaced_by_token_id IS NULL
                OR consumed_at IS NOT NULL
            )
);

CREATE INDEX ix_refresh_tokens_active_session
    ON identity.refresh_tokens
        (
         session_id,
         expires_at DESC
            )
    WHERE revoked_at IS NULL
        AND consumed_at IS NULL;

CREATE INDEX ix_refresh_tokens_user
    ON identity.refresh_tokens
        (
         user_id,
         issued_at DESC
            );

RESET ROLE;
