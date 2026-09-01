SET ROLE fintrack_owner;

-- =========================================================
-- Supported currencies
-- =========================================================

CREATE TABLE finance.currencies
(
    code           VARCHAR(3)    NOT NULL,
    name           VARCHAR(100)  NOT NULL,
    symbol         VARCHAR(8),
    decimal_places SMALLINT      NOT NULL DEFAULT 2,
    active         BOOLEAN       NOT NULL DEFAULT TRUE,
    display_order  SMALLINT      NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_currencies
        PRIMARY KEY (code),

    CONSTRAINT ck_currencies_code
        CHECK (code ~ '^[A-Z]{3}$'),

    CONSTRAINT ck_currencies_name_not_blank
        CHECK (btrim(name) <> ''),

    CONSTRAINT ck_currencies_symbol_not_blank
        CHECK (
            symbol IS NULL
                OR btrim(symbol) <> ''
            ),

    CONSTRAINT ck_currencies_decimal_places
        CHECK (decimal_places BETWEEN 0 AND 4),

    CONSTRAINT ck_currencies_display_order
        CHECK (display_order >= 0)
);

INSERT INTO finance.currencies
(
    code,
    name,
    symbol,
    decimal_places,
    display_order
)
VALUES
    ('ZAR', 'South African Rand', 'R', 2, 10),
    ('USD', 'United States Dollar', '$', 2, 20),
    ('EUR', 'Euro', '€', 2, 30),
    ('GBP', 'British Pound Sterling', '£', 2, 40);

-- =========================================================
-- Default category templates
-- =========================================================

CREATE TABLE finance.category_templates
(
    code          VARCHAR(50)    NOT NULL,
    name          VARCHAR(100)   NOT NULL,
    category_type VARCHAR(20)    NOT NULL,
    display_order SMALLINT       NOT NULL DEFAULT 0,
    active        BOOLEAN        NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_category_templates
        PRIMARY KEY (code),

    CONSTRAINT uq_category_templates_code_type
        UNIQUE (code, category_type),

    CONSTRAINT ck_category_templates_code
        CHECK (code ~ '^[A-Z][A-Z0-9_]*$'),

    CONSTRAINT ck_category_templates_name_not_blank
        CHECK (btrim(name) <> ''),

    CONSTRAINT ck_category_templates_type
        CHECK (
            category_type IN (
                              'INCOME',
                              'EXPENSE'
                )
            ),

    CONSTRAINT ck_category_templates_display_order
        CHECK (display_order >= 0)
);

INSERT INTO finance.category_templates
(
    code,
    name,
    category_type,
    display_order
)
VALUES
    ('SALARY',         'Salary',          'INCOME',  10),
    ('FREELANCE',      'Freelance',       'INCOME',  20),
    ('BONUS',          'Bonus',           'INCOME',  30),
    ('INTEREST',       'Interest',        'INCOME',  40),
    ('OTHER_INCOME',   'Other Income',    'INCOME',  50),

    ('GROCERIES',      'Groceries',       'EXPENSE', 100),
    ('RENT',           'Rent',            'EXPENSE', 110),
    ('TRANSPORT',      'Transport',       'EXPENSE', 120),
    ('UTILITIES',      'Utilities',       'EXPENSE', 130),
    ('EDUCATION',      'Education',       'EXPENSE', 140),
    ('ENTERTAINMENT',  'Entertainment',   'EXPENSE', 150),
    ('HEALTHCARE',     'Healthcare',      'EXPENSE', 160),
    ('INSURANCE',      'Insurance',       'EXPENSE', 170),
    ('SUBSCRIPTIONS',  'Subscriptions',   'EXPENSE', 180),
    ('DEBT_PAYMENT',   'Debt Payment',    'EXPENSE', 190),
    ('OTHER_EXPENSE',  'Other Expense',   'EXPENSE', 200);

-- Default finance-table privileges include INSERT and UPDATE.
-- These two reference tables must remain read-only to the application.

REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
    ON TABLE finance.currencies
    FROM fintrack_application;

REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
    ON TABLE finance.category_templates
    FROM fintrack_application;

GRANT SELECT
    ON TABLE
    finance.currencies,
    finance.category_templates
    TO fintrack_application;

RESET ROLE;
