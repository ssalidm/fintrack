SET ROLE fintrack_owner;

ALTER TABLE identity.users
    ADD COLUMN preferred_name VARCHAR(100);

ALTER TABLE identity.users
    ADD CONSTRAINT ck_users_preferred_name_not_blank
        CHECK (
            preferred_name IS NULL
                OR btrim(preferred_name) <> ''
            );

RESET ROLE;
