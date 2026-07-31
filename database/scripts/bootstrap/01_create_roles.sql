\set ON_ERROR_STOP on

\if :{?migration_password}
\else
\echo 'ERROR: migration_password was not provided.'
\quit
\endif

\if :{?application_password}
\else
\echo 'ERROR: application_password was not provided.'
\quit
\endif

-- =========================================================
-- Ownership role
-- =========================================================

DO
$$
    BEGIN
        IF NOT EXISTS (
            SELECT 1
            FROM pg_roles
            WHERE rolname = 'fintrack_owner'
        ) THEN
            CREATE ROLE fintrack_owner;
        END IF;
    END
$$;

ALTER ROLE fintrack_owner
    NOLOGIN
    NOSUPERUSER
    NOCREATEDB
    NOCREATEROLE
    NOREPLICATION
    NOBYPASSRLS;

-- =========================================================
-- Migration login
-- =========================================================

DO
$$
    BEGIN
        IF NOT EXISTS (
            SELECT 1
            FROM pg_roles
            WHERE rolname = 'fintrack_migration'
        ) THEN
            CREATE ROLE fintrack_migration LOGIN;
        END IF;
    END
$$;

ALTER ROLE fintrack_migration
    LOGIN
    NOINHERIT
    NOSUPERUSER
    NOCREATEDB
    NOCREATEROLE
    NOREPLICATION
    NOBYPASSRLS
    CONNECTION LIMIT 10;

SELECT format(
           'ALTER ROLE fintrack_migration PASSWORD %L',
           :'migration_password'
       )
\gexec

-- =========================================================
-- Spring Boot application login
-- =========================================================

DO
$$
    BEGIN
        IF NOT EXISTS (
            SELECT 1
            FROM pg_roles
            WHERE rolname = 'fintrack_application'
        ) THEN
            CREATE ROLE fintrack_application LOGIN;
        END IF;
    END
$$;

ALTER ROLE fintrack_application
    LOGIN
    NOINHERIT
    NOSUPERUSER
    NOCREATEDB
    NOCREATEROLE
    NOREPLICATION
    NOBYPASSRLS
    CONNECTION LIMIT 30;

SELECT format(
           'ALTER ROLE fintrack_application PASSWORD %L',
           :'application_password'
       )
\gexec

-- =========================================================
-- Membership
-- =========================================================

GRANT fintrack_owner
    TO fintrack_migration
    WITH
        INHERIT FALSE,
        SET TRUE,
        ADMIN FALSE;
