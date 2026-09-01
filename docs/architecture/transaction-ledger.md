# FinTrack Transaction Ledger

## Overview

FinTrack uses transaction history as the source of truth for account balances.

The system does not store a mutable `current_balance` column.

## Transaction types

- `INCOME`
- `EXPENSE`
- `TRANSFER_IN`
- `TRANSFER_OUT`

All transaction amounts are stored as positive values.

The transaction type determines the balance effect.

| Type | Effect |
|---|---:|
| `INCOME` | Positive |
| `EXPENSE` | Negative |
| `TRANSFER_IN` | Positive |
| `TRANSFER_OUT` | Negative |

## Categories

Income transactions require an active income category.

Expense transactions require an active expense category.

Transfers do not use categories.

## Transfers

A transfer consists of:

1. One transfer record.
2. One `TRANSFER_OUT` transaction.
3. One `TRANSFER_IN` transaction.

The transfer is created through `finance.create_transfer`.

Direct application inserts and updates against `finance.transfers` are not
permitted.

## Transfer atomicity

Transfer creation runs inside one PostgreSQL transaction.

If any transfer operation fails, every related write is rolled back.

## Ownership

Composite foreign keys ensure that transactions, accounts, categories, and
transfers all belong to the same user.

## Voiding

Historical financial records are voided instead of physically deleted.

A voided transaction:

- Remains in the database
- Does not affect balances
- Does not affect cash-flow reports
- Retains its audit history

Transfer legs are voided together through `finance.void_transfer`.

## Account balances

Balances are calculated as:

```text
opening balance
+ posted income
- posted expenses
+ posted transfer-ins
- posted transfer-outs
```

## Reporting

`reporting.account_balances` provides current calculated balances.

`reporting.monthly_cash_flow` provides monthly income, expenses, and net cash
flow while excluding transfers.
