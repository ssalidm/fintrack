SET ROLE fintrack_owner;

GRANT SELECT, INSERT, UPDATE
    ON TABLE finance.recurring_transactions
    TO fintrack_application;

RESET ROLE;
