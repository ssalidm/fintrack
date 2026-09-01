# FinTrack Financial Planning Domain

## Overview

The financial-planning domain provides monthly budgets, savings goals, and
recurring transaction schedules.

## Budgets

A budget belongs to one user, month, and currency.

Each budget contains one or more expense-category limits.

Budget spending is calculated from posted expense transactions whose:

- User matches the budget user
- Category matches the budget category
- Transaction date falls within the budget month
- Account currency matches the budget currency

Transfers and income transactions do not count toward budget spending.

## Savings goals

A savings goal has:

- A target amount
- A currency
- An optional target date
- A contribution history

Goal contributions do not directly affect account balances.

A contribution may accompany a real account transfer, but the ledger transfer
and goal allocation remain separate concepts.

## Recurring transactions

Recurring schedules support:

- Daily
- Weekly
- Monthly
- Yearly

The initial model supports recurring income and expenses.

Recurring transfers will be introduced separately because they require source
and destination accounts and atomic two-sided ledger entries.

## Duplicate prevention

Generated transactions retain:

- Their recurring schedule ID
- Their scheduled due date

A unique index prevents the same recurring occurrence from being generated
more than once.

## Reporting views

- `reporting.budget_performance`
- `reporting.savings_goal_progress`
- `reporting.recurring_transactions_due`
