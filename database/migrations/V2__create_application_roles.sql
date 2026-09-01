SET ROLE fintrack_owner;

CREATE TABLE identity.application_roles
(
    id          UUID           NOT NULL DEFAULT gen_random_uuid(),
    code        VARCHAR(50)    NOT NULL,
    name        VARCHAR(100)   NOT NULL,
    description VARCHAR(500),
    system_role BOOLEAN        NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_application_roles
        PRIMARY KEY (id),

    CONSTRAINT uq_application_roles_code
        UNIQUE (code),

    CONSTRAINT ck_application_roles_code
        CHECK (code ~ '^ROLE_[A-Z][A-Z0-9_]*$'),

    CONSTRAINT ck_application_roles_name_not_blank
        CHECK (btrim(name) <> '')
);

CREATE TABLE identity.user_roles
(
    user_id             UUID           NOT NULL,
    role_id             UUID           NOT NULL,
    assigned_at         TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    assigned_by_user_id UUID,

    CONSTRAINT pk_user_roles
        PRIMARY KEY (user_id, role_id),

    CONSTRAINT fk_user_roles_user
        FOREIGN KEY (user_id)
            REFERENCES identity.users (id)
            ON DELETE CASCADE,

    CONSTRAINT fk_user_roles_role
        FOREIGN KEY (role_id)
            REFERENCES identity.application_roles (id)
            ON DELETE RESTRICT,

    CONSTRAINT fk_user_roles_assigned_by
        FOREIGN KEY (assigned_by_user_id)
            REFERENCES identity.users (id)
            ON DELETE SET NULL
);

CREATE INDEX ix_user_roles_role_id
    ON identity.user_roles (role_id);

INSERT INTO identity.application_roles
(code,
 name,
 description,
 system_role)
VALUES ('ROLE_USER',
        'User',
        'Standard FinTrack user',
        TRUE),

       ('ROLE_ADMIN',
        'Administrator',
        'Administrative FinTrack user',
        TRUE);

RESET ROLE;
