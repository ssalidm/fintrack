SET ROLE fintrack_owner;

ALTER TABLE identity.users
    ALTER COLUMN password_hash DROP NOT NULL;

ALTER TABLE identity.users
    DROP CONSTRAINT ck_users_password_hash_not_blank;

ALTER TABLE identity.users
    ADD CONSTRAINT ck_users_password_hash_not_blank
        CHECK (
            password_hash IS NULL
                OR btrim(password_hash) <> ''
            );


CREATE TABLE identity.external_identities
(
    id               UUID           NOT NULL DEFAULT gen_random_uuid(),
    user_id          UUID           NOT NULL,
    provider         VARCHAR(32)    NOT NULL,
    provider_subject VARCHAR(255)   NOT NULL,
    linked_at        TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_external_identities
        PRIMARY KEY (id),

    CONSTRAINT fk_external_identities_user
        FOREIGN KEY (user_id)
            REFERENCES identity.users (id)
            ON DELETE CASCADE,

    CONSTRAINT uq_external_identities_provider_subject
        UNIQUE (
                provider,
                provider_subject
            ),

    CONSTRAINT uq_external_identities_user_provider
        UNIQUE (
                user_id,
                provider
            ),

    CONSTRAINT ck_external_identities_provider
        CHECK (
            provider IN ('GOOGLE')
            ),

    CONSTRAINT ck_external_identities_provider_subject_not_blank
        CHECK (
            btrim(provider_subject) <> ''
            )
);

RESET ROLE;
