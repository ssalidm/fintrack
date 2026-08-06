# FinTrack Query Performance Strategy

## Principles

FinTrack adds indexes only for demonstrated query patterns.

Indexes are evaluated using:

- `EXPLAIN`
- `EXPLAIN ANALYZE`
- Buffer statistics
- Actual and estimated row counts
- Index-usage statistics
- Table and index sizes

## Important query patterns

### Recent transactions

Filter by:

- `user_id`
- `status = POSTED`

Order by:

- `transaction_date DESC`
- `created_at DESC`

### Monthly cash flow

Filter by:

- `user_id`
- Posted status
- Income and expense transaction types
- Transaction-date range

### Monthly category spending

Filter by:

- `user_id`
- Posted expense transactions
- Transaction-date range

Group by:

- Category
- Currency

### Account balances

Calculate from:

- Account opening balance
- Posted income
- Posted expenses
- Posted transfer legs

## Indexing rules

- Primary keys and unique constraints already create indexes.
- Avoid adding duplicate indexes.
- Prefer indexes aligned with actual filters and sort order.
- Use partial indexes for frequently queried record subsets.
- Use included columns only when they support important read paths.
- Re-evaluate unused indexes after representative production usage.
- Remember that every index adds write and storage overhead.

## Reporting views

- `reporting.account_balances`
- `reporting.monthly_cash_flow`
- `reporting.budget_performance`
- `reporting.savings_goal_progress`
- `reporting.recurring_transactions_due`
- `reporting.monthly_category_spending`
- `reporting.net_worth_by_currency`
