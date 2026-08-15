SET ROLE fintrack_owner;

GRANT USAGE
ON SCHEMA finance
TO fintrack_application;

GRANT SELECT
ON TABLE finance.currencies
TO fintrack_application;

GRANT SELECT, INSERT, UPDATE
ON TABLE finance.accounts
TO fintrack_application;

RESET ROLE;
