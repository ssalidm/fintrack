SET ROLE fintrack_owner;

CREATE INDEX ix_mfa_login_challenges_expires_at
    ON identity.mfa_login_challenges (expires_at);

RESET ROLE;
