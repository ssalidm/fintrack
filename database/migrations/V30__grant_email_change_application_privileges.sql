SET ROLE fintrack_owner;

GRANT USAGE ON SCHEMA identity
    TO fintrack_application;

GRANT SELECT, INSERT, UPDATE, DELETE
    ON TABLE identity.email_change_requests
    TO fintrack_application;

RESET ROLE;
