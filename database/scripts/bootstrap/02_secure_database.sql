\set ON_ERROR_STOP on

-- =========================================================
-- Database ownership and connection permissions
-- =========================================================

SELECT format(
           'ALTER DATABASE %I OWNER TO fintrack_owner',
           current_database()
       )
\gexec

SELECT format(
           'REVOKE ALL PRIVILEGES ON DATABASE %I FROM PUBLIC',
           current_database()
       )
\gexec

SELECT format(
           'GRANT CONNECT, TEMPORARY ON DATABASE %I TO fintrack_migration',
           current_database()
       )
\gexec

SELECT format(
           'GRANT CONNECT ON DATABASE %I TO fintrack_application',
           current_database()
       )
\gexec

-- =========================================================
-- Harden the public schema
-- =========================================================

REVOKE ALL PRIVILEGES
    ON SCHEMA public
    FROM PUBLIC;

-- =========================================================
-- Application schema boundaries
-- =========================================================

CREATE SCHEMA IF NOT EXISTS infra
    AUTHORIZATION fintrack_owner;

CREATE SCHEMA IF NOT EXISTS identity
    AUTHORIZATION fintrack_owner;

CREATE SCHEMA IF NOT EXISTS finance
    AUTHORIZATION fintrack_owner;

CREATE SCHEMA IF NOT EXISTS reporting
    AUTHORIZATION fintrack_owner;

CREATE SCHEMA IF NOT EXISTS audit
    AUTHORIZATION fintrack_owner;

ALTER SCHEMA infra OWNER TO fintrack_owner;
ALTER SCHEMA identity OWNER TO fintrack_owner;
ALTER SCHEMA finance OWNER TO fintrack_owner;
ALTER SCHEMA reporting OWNER TO fintrack_owner;
ALTER SCHEMA audit OWNER TO fintrack_owner;

REVOKE ALL PRIVILEGES
    ON SCHEMA infra, identity, finance, reporting, audit
    FROM PUBLIC;

-- Flyway owns and maintains its infrastructure metadata.
-- This does not grant access to application-domain schemas.
GRANT USAGE, CREATE
    ON SCHEMA infra
    TO fintrack_migration;

-- Spring Boot may resolve objects in these schemas, but cannot create them.
GRANT USAGE
    ON SCHEMA identity, finance, reporting, audit
    TO fintrack_application;

-- The application deliberately receives no access to the infra schema.
REVOKE ALL PRIVILEGES
    ON SCHEMA infra
    FROM fintrack_application;

-- =========================================================
-- Default privileges for future objects
-- These rules apply to objects created by fintrack_owner.
-- =========================================================

SET ROLE fintrack_owner;

-- Authentication and user-management tables
ALTER DEFAULT PRIVILEGES
    FOR ROLE fintrack_owner
    IN SCHEMA identity
    GRANT SELECT, INSERT, UPDATE
    ON TABLES
    TO fintrack_application;

-- Financial-domain tables
ALTER DEFAULT PRIVILEGES
    FOR ROLE fintrack_owner
    IN SCHEMA finance
    GRANT SELECT, INSERT, UPDATE
    ON TABLES
    TO fintrack_application;

-- Reporting views and tables are read-only to the application
ALTER DEFAULT PRIVILEGES
    FOR ROLE fintrack_owner
    IN SCHEMA reporting
    GRANT SELECT
    ON TABLES
    TO fintrack_application;

-- The application may create and read audit records
ALTER DEFAULT PRIVILEGES
    FOR ROLE fintrack_owner
    IN SCHEMA audit
    GRANT SELECT, INSERT
    ON TABLES
    TO fintrack_application;

-- Future sequences, if any are introduced
ALTER DEFAULT PRIVILEGES
    FOR ROLE fintrack_owner
    IN SCHEMA identity
    GRANT USAGE, SELECT
    ON SEQUENCES
    TO fintrack_application;

ALTER DEFAULT PRIVILEGES
    FOR ROLE fintrack_owner
    IN SCHEMA finance
    GRANT USAGE, SELECT
    ON SEQUENCES
    TO fintrack_application;

ALTER DEFAULT PRIVILEGES
    FOR ROLE fintrack_owner
    IN SCHEMA audit
    GRANT USAGE, SELECT
    ON SEQUENCES
    TO fintrack_application;

-- Permit use of future domains and custom types
ALTER DEFAULT PRIVILEGES
    FOR ROLE fintrack_owner
    IN SCHEMA identity
    GRANT USAGE
    ON TYPES
    TO fintrack_application;

ALTER DEFAULT PRIVILEGES
    FOR ROLE fintrack_owner
    IN SCHEMA finance
    GRANT USAGE
    ON TYPES
    TO fintrack_application;

ALTER DEFAULT PRIVILEGES
    FOR ROLE fintrack_owner
    IN SCHEMA reporting
    GRANT USAGE
    ON TYPES
    TO fintrack_application;

ALTER DEFAULT PRIVILEGES
    FOR ROLE fintrack_owner
    IN SCHEMA audit
    GRANT USAGE
    ON TYPES
    TO fintrack_application;

-- PostgreSQL normally gives PUBLIC execute permission on new functions.
-- We revoke that default and will grant functions individually.
ALTER DEFAULT PRIVILEGES
    FOR ROLE fintrack_owner
    REVOKE EXECUTE
    ON FUNCTIONS
    FROM PUBLIC;

RESET ROLE;

-- =========================================================
-- Secure role-specific connection settings
-- =========================================================

SELECT format(
           'ALTER ROLE fintrack_migration IN DATABASE %I
            SET search_path = pg_catalog',
           current_database()
       )
\gexec

SELECT format(
           'ALTER ROLE fintrack_application IN DATABASE %I
            SET search_path = pg_catalog',
           current_database()
       )
\gexec

SELECT format(
           'ALTER ROLE fintrack_application IN DATABASE %I
            SET statement_timeout = %L',
           current_database(),
           '15s'
       )
\gexec

SELECT format(
           'ALTER ROLE fintrack_application IN DATABASE %I
            SET lock_timeout = %L',
           current_database(),
           '5s'
       )
\gexec

SELECT format(
           'ALTER ROLE fintrack_application IN DATABASE %I
            SET idle_in_transaction_session_timeout = %L',
           current_database(),
           '30s'
       )
\gexec
