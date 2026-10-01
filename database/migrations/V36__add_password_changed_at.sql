SET ROLE fintrack_owner;

ALTER TABLE identity.users
    ADD COLUMN password_changed_at timestamptz;
