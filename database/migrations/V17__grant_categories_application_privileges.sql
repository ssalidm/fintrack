SET ROLE fintrack_owner;

GRANT SELECT, INSERT, UPDATE
    ON TABLE finance.categories
    TO fintrack_application;

RESET ROLE;
