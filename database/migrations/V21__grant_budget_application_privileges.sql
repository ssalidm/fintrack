SET ROLE fintrack_owner;

GRANT SELECT, INSERT, UPDATE
    ON TABLE finance.budgets
    TO fintrack_application;

GRANT SELECT, INSERT, UPDATE, DELETE
    ON TABLE finance.budget_category_limits
    TO fintrack_application;

RESET ROLE;
