CREATE ROLE fintrack_owner
    NOLOGIN
    NOSUPERUSER
    NOCREATEDB
    NOCREATEROLE
    NOBYPASSRLS;

CREATE ROLE fintrack_migration
    LOGIN
    PASSWORD 'migration-test-password'
    NOINHERIT
    NOSUPERUSER
    NOCREATEDB
    NOCREATEROLE
    NOBYPASSRLS;

CREATE ROLE fintrack_application
    LOGIN
    PASSWORD 'application-test-password'
    NOINHERIT
    NOSUPERUSER
    NOCREATEDB
    NOCREATEROLE
    NOBYPASSRLS;


-- Migration role may explicitly become the owner role.
GRANT fintrack_owner
    TO fintrack_migration
    WITH
        INHERIT FALSE,
        SET TRUE,
        ADMIN FALSE;


-- Match FinTrack database ownership.
ALTER DATABASE fintrack_test_db
    OWNER TO fintrack_owner;


-- Flyway infrastructure remains owned by the migration role.
CREATE SCHEMA infra
    AUTHORIZATION fintrack_migration;


-- Domain schemas are owned by the NOLOGIN owner role.
CREATE SCHEMA identity
    AUTHORIZATION fintrack_owner;

CREATE SCHEMA finance
    AUTHORIZATION fintrack_owner;

CREATE SCHEMA reporting
    AUTHORIZATION fintrack_owner;

CREATE SCHEMA audit
    AUTHORIZATION fintrack_owner;


-- Remove implicit PUBLIC access.
REVOKE ALL
    ON SCHEMA public
    FROM PUBLIC;

REVOKE ALL
    ON SCHEMA infra, identity, finance, reporting, audit
    FROM PUBLIC;

REVOKE ALL
    ON DATABASE fintrack_test_db
    FROM PUBLIC;


-- Both runtime identities need to connect.
GRANT CONNECT
    ON DATABASE fintrack_test_db
    TO fintrack_migration, fintrack_application;

-- Runtime application may resolve application-facing schemas.
GRANT USAGE
    ON SCHEMA identity, finance, reporting
    TO fintrack_application;


-- Tables created later by fintrack_owner in the identity schema
-- receive the same runtime privileges as the real FinTrack database.
ALTER DEFAULT PRIVILEGES
    FOR ROLE fintrack_owner
    IN SCHEMA identity
    GRANT SELECT, INSERT, UPDATE
    ON TABLES
    TO fintrack_application;

-- Flyway must be able to maintain its own history table.
GRANT USAGE, CREATE
    ON SCHEMA infra
    TO fintrack_migration;
