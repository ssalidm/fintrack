SET ROLE fintrack_owner;

ALTER TABLE identity.user_mfa
    ADD COLUMN failed_attempt_count SMALLINT NOT NULL DEFAULT 0,
    ADD COLUMN locked_until TIMESTAMPTZ;

ALTER TABLE identity.user_mfa
    ADD CONSTRAINT ck_user_mfa_failed_attempt_count
        CHECK (failed_attempt_count >= 0);

RESET ROLE;
