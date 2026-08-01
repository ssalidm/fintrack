# FinTrack Accounts and Categories

## Overview

The accounts and categories domain provides the foundation for recording
financial transactions.

Every account and category belongs to one FinTrack user.

## Supported currencies

Supported currencies are stored in `finance.currencies`.

The initial currencies are:

- ZAR
- USD
- EUR
- GBP

Currency reference data is read-only to the running application.

## Accounts

Supported account types are:

- `CASH`
- `CURRENT`
- `SAVINGS`
- `CREDIT_CARD`
- `INVESTMENT`
- `OTHER`

Account statuses are:

- `ACTIVE`
- `ARCHIVED`

An archived account remains available for historical reporting but cannot be
used for new ordinary transactions.

Account balance is not stored as a mutable column. It will be calculated from:

```text
opening balance + posted transaction effects
```

## Account-name uniqueness

A user may have only one active account with a given normalized name.

Names are compared after:

1. Removing leading and trailing whitespace.
2. Converting them to lowercase.

Archived accounts do not prevent a new active account from using the same
name.

## Categories

Categories have one of two types:

- `INCOME`
- `EXPENSE`

Category statuses are:

- `ACTIVE`
- `ARCHIVED`

Transfers do not use income or expense categories.

## Category templates

FinTrack stores standard category definitions in
`finance.category_templates`.

When a user registers, the backend will copy active templates into
`finance.categories`.

Users may rename or archive their copied categories without changing the
global templates.

## ER diagram

```mermaid
erDiagram
    USERS ||--o{ ACCOUNTS : owns
    USERS ||--o{ CATEGORIES : owns
    CURRENCIES ||--o{ ACCOUNTS : denominates
    CATEGORY_TEMPLATES o|--o{ CATEGORIES : originates

    ACCOUNTS {
        uuid id PK
        uuid user_id FK
        varchar name
        varchar account_type
        varchar currency_code FK
        numeric opening_balance
        varchar status
        boolean include_in_net_worth
        timestamptz archived_at
        timestamptz created_at
        timestamptz updated_at
        bigint version
    }

    CURRENCIES {
        varchar code PK
        varchar name
        varchar symbol
        smallint decimal_places
        boolean active
    }

    CATEGORY_TEMPLATES {
        varchar code PK
        varchar name
        varchar category_type
        smallint display_order
        boolean active
    }

    CATEGORIES {
        uuid id PK
        uuid user_id FK
        varchar template_code FK
        varchar name
        varchar category_type
        varchar status
        smallint display_order
        timestamptz archived_at
        timestamptz created_at
        timestamptz updated_at
        bigint version
    }
```
