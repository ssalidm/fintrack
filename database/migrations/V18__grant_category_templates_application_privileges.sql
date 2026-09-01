SET ROLE fintrack_owner;

GRANT SELECT
ON TABLE finance.category_templates
TO fintrack_application;

RESET ROLE;
