SET ROLE fintrack_owner;

GRANT USAGE
    ON SCHEMA identity
    TO fintrack_application;

GRANT SELECT, INSERT, UPDATE, DELETE
    ON TABLE identity.user_mfa
    TO fintrack_application;

GRANT SELECT, INSERT, UPDATE, DELETE
    ON TABLE identity.mfa_recovery_codes
    TO fintrack_application;

GRANT SELECT, INSERT, UPDATE, DELETE
    ON TABLE identity.mfa_login_challenges
    TO fintrack_application;

RESET ROLE;
