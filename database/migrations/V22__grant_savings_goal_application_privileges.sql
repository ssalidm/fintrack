SET ROLE fintrack_owner;

GRANT SELECT, INSERT, UPDATE
    ON TABLE finance.savings_goals
    TO fintrack_application;

GRANT SELECT, INSERT, UPDATE
    ON TABLE finance.goal_contributions
    TO fintrack_application;

RESET ROLE;
