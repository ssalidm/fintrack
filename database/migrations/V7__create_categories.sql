SET ROLE fintrack_owner;

CREATE TABLE finance.categories
(
    id             UUID           NOT NULL DEFAULT gen_random_uuid(),
    user_id        UUID           NOT NULL,
    template_code  VARCHAR(50),
    name           VARCHAR(100)   NOT NULL,
    category_type  VARCHAR(20)    NOT NULL,
    status         VARCHAR(16)    NOT NULL DEFAULT 'ACTIVE',
    display_order  SMALLINT       NOT NULL DEFAULT 0,
    archived_at    TIMESTAMPTZ(6),
    created_at     TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version        BIGINT         NOT NULL DEFAULT 0,

    CONSTRAINT pk_categories
        PRIMARY KEY (id),

    CONSTRAINT fk_categories_user
        FOREIGN KEY (user_id)
            REFERENCES identity.users (id)
            ON DELETE RESTRICT,

    CONSTRAINT fk_categories_template_type
        FOREIGN KEY (template_code, category_type)
            REFERENCES finance.category_templates (code, category_type)
            ON UPDATE RESTRICT
            ON DELETE RESTRICT,

    CONSTRAINT uq_categories_user_template
        UNIQUE (user_id, template_code),

    CONSTRAINT ck_categories_name_not_blank
        CHECK (btrim(name) <> ''),

    CONSTRAINT ck_categories_type
        CHECK (
            category_type IN (
                              'INCOME',
                              'EXPENSE'
                )
            ),

    CONSTRAINT ck_categories_status
        CHECK (
            status IN (
                       'ACTIVE',
                       'ARCHIVED'
                )
            ),

    CONSTRAINT ck_categories_display_order
        CHECK (display_order >= 0),

    CONSTRAINT ck_categories_archive_state
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

    CONSTRAINT ck_categories_archived_after_creation
        CHECK (
            archived_at IS NULL
                OR archived_at >= created_at
            ),

    CONSTRAINT ck_categories_updated_after_creation
        CHECK (updated_at >= created_at),

    CONSTRAINT ck_categories_version
        CHECK (version >= 0)
);

-- Active category names must be unique per user and category type.
CREATE UNIQUE INDEX uq_categories_active_user_type_name
    ON finance.categories
        (
         user_id,
         category_type,
         lower(btrim(name))
            )
    WHERE status = 'ACTIVE';

CREATE INDEX ix_categories_user_type_status
    ON finance.categories
        (
         user_id,
         category_type,
         status,
         display_order
            );

RESET ROLE;
