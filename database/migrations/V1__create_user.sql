SET ROLE fintrack_owner;

CREATE TABLE identity.users
(
    id                    UUID           NOT NULL DEFAULT gen_random_uuid(),
    email                 VARCHAR(320)   NOT NULL,
    password_hash         VARCHAR(255)   NOT NULL,
    first_name            VARCHAR(100)   NOT NULL,
    last_name             VARCHAR(100)   NOT NULL,
    status                VARCHAR(32)    NOT NULL DEFAULT 'PENDING_VERIFICATION',
    email_verified_at     TIMESTAMPTZ(6),
    failed_login_attempts INTEGER        NOT NULL DEFAULT 0,
    locked_until          TIMESTAMPTZ(6),
    last_login_at         TIMESTAMPTZ(6),
    created_at            TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version               BIGINT         NOT NULL DEFAULT 0,

    CONSTRAINT pk_users
        PRIMARY KEY (id),

    CONSTRAINT uq_users_email
        UNIQUE (email),

    CONSTRAINT ck_users_email_not_blank
        CHECK (btrim(email) <> ''),

    CONSTRAINT ck_users_email_normalized
        CHECK (email = lower(btrim(email))),

    CONSTRAINT ck_users_email_basic_format
        CHECK (
            position('@' IN email) > 1
                AND position('.' IN split_part(email, '@', 2)) > 0
            ),

    CONSTRAINT ck_users_first_name_not_blank
        CHECK (btrim(first_name) <> ''),

    CONSTRAINT ck_users_last_name_not_blank
        CHECK (btrim(last_name) <> ''),

    CONSTRAINT ck_users_password_hash_not_blank
        CHECK (btrim(password_hash) <> ''),

    CONSTRAINT ck_users_status
        CHECK (
            status IN (
                       'PENDING_VERIFICATION',
                       'ACTIVE',
                       'LOCKED',
                       'DEACTIVATED'
                )
            ),

    CONSTRAINT ck_users_failed_login_attempts
        CHECK (failed_login_attempts >= 0),

    CONSTRAINT ck_users_version
        CHECK (version >= 0),

    CONSTRAINT ck_users_updated_after_created
        CHECK (updated_at >= created_at)
);

CREATE INDEX ix_users_status
    ON identity.users (status);

CREATE INDEX ix_users_locked_until
    ON identity.users (locked_until)
    WHERE locked_until IS NOT NULL;

RESET ROLE;
