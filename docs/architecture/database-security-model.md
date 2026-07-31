# FinTrack Database Security Model

## Purpose

FinTrack uses separate PostgreSQL roles for database ownership, schema
migration, and application access.

This follows the principle of least privilege and prevents the running
application from owning or administrating database objects.

## Roles

### `postgres`

Local bootstrap administrator.

This role is used only to:

- Create and configure database roles
- Assign database ownership
- Perform local database recovery or administration

The Spring Boot application must never use this account.

### `fintrack_owner`

Non-login ownership role.

This role owns:

- The FinTrack database
- Application schemas
- Tables
- Views
- Indexes
- Functions
- Other application database objects

Because it has `NOLOGIN`, clients cannot connect directly using this role.

### `fintrack_migration`

Login role used by Flyway.

It may execute:

```sql
SET ROLE fintrack_owner;
```

Migrations therefore create objects owned by `fintrack_owner`, rather than by
the migration login.

It is not a superuser and cannot create databases or roles.

### `fintrack_application`

Restricted login used by Spring Boot.

It receives:

- Schema `USAGE`
- Required table data privileges
- Read-only reporting access
- Permission to insert audit events

It cannot:

- Create schemas
- Create tables
- Drop database objects
- Become `fintrack_owner`
- Create roles
- Create databases
- Bypass row-level security

## Schemas
| Schema      | Purpose                                        | Application access      |
| ----------- | ---------------------------------------------- | ----------------------- |
| `infra`     | Flyway history and infrastructure metadata     | None                    |
| `identity`  | Users, roles, sessions and security tokens     | Read, insert and update |
| `finance`   | Accounts, categories, transactions and budgets | Read, insert and update |
| `reporting` | Reporting views and projections                | Read only               |
| `audit`     | Security and business audit events             | Read and insert         |

## Object ownership

Flyway connects as `fintrack_migration` and switches to `fintrack_owner`
before applying migrations.

All application migration SQL must use schema-qualified object names.

Examples:

```sql
CREATE TABLE finance.accounts (...);
CREATE TABLE identity.users (...);
CREATE VIEW reporting.monthly_cash_flow AS ...;
```

Unqualified application object names should not be used.

## Public access

Broad privileges are revoked from PostgreSQL's PUBLIC role.

The `public` schema is not used for FinTrack application objects.

## Flyway boundary

Infrastructure bootstrap scripts manage:

- Roles
- Login credentials
- Database ownership
- Top-level schemas
- Base grants

Flyway manages:

- Tables
- Constraints
- Indexes
- Views
- Functions
- Reference data
- Schema changes
