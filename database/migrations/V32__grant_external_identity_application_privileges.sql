SET ROLE fintrack_owner;

GRANT USAGE ON SCHEMA identity
    TO fintrack_application;

GRANT SELECT, INSERT, UPDATE, DELETE
    ON TABLE identity.external_identities
    TO fintrack_application;

RESET ROLE;
