SET ROLE fintrack_owner;

GRANT SELECT
    ON TABLE finance.transfers
    TO fintrack_application;

GRANT EXECUTE
    ON FUNCTION finance.create_transfer(
    uuid,
    uuid,
    uuid,
    numeric,
    date,
    varchar
    )
    TO fintrack_application;

GRANT EXECUTE
    ON FUNCTION finance.void_transfer(
    uuid,
    uuid,
    varchar
    )
    TO fintrack_application;

RESET ROLE;
