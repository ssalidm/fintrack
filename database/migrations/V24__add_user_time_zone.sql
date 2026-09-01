SET ROLE fintrack_owner;

ALTER TABLE identity.users
    ADD COLUMN time_zone varchar(64) NOT NULL DEFAULT 'UTC';

ALTER TABLE identity.users
    ADD CONSTRAINT ck_users_time_zone_not_blank
        CHECK (btrim(time_zone) <> '');

COMMENT ON COLUMN identity.users.time_zone IS
    'IANA timezone used for user-specific financial calendar calculations';

RESET ROLE;
