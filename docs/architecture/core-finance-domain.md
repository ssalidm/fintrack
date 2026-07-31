# FinTrack Core Finance Domain

## Purpose

This document defines the initial logical model for users, financial accounts,
categories, transactions, and account transfers.

## Core entities

- User
- Account
- Category
- Transaction
- Transfer

## Ownership

Every account, category, transaction, and transfer belongs to one user.

Application queries must include the authenticated user's identifier when
loading user-owned resources.

## Account balances

Account balances are calculated rather than stored as mutable source-of-truth
values.

```text
current balance
=
opening balance
+
income
-
expenses
+
transfer-ins
-
transfer-outs
```

Only posted transactions affect balances.

## Transaction types

- `INCOME`
- `EXPENSE`
- `TRANSFER_IN`
- `TRANSFER_OUT`

Transaction amounts are always greater than zero. The transaction type
determines the effect on the account balance.

## Categories

Categories are either:

- `INCOME`
- `EXPENSE`

Transfers are not assigned income or expense categories.

## Transfers

A transfer creates:

1. One `TRANSFER_OUT` transaction for the source account.
2. One `TRANSFER_IN` transaction for the destination account.

Both records reference the same transfer and must be created inside one
database transaction.

Transfers are excluded from income and expense reports.

## Currency

Each account has one three-character currency code.

The MVP supports transfers only between accounts that use the same currency.

## Historical integrity

Transactions are voided rather than physically deleted when they have already
contributed to financial history.

Voided transactions remain available for auditing but do not affect balances
or reports.

## Monetary precision

PostgreSQL monetary amounts will use `NUMERIC(19, 4)`.

Java monetary values will use `BigDecimal`.

Floating-point types must not be used for financial calculations.

---
