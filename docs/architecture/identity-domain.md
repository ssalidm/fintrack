# FinTrack Identity Domain

## Purpose

The identity domain manages users, application authorization roles,
authentication sessions, refresh tokens, email verification, and password
recovery.

## Core rules

- User email addresses are normalized before storage.
- Email addresses are unique.
- Passwords are stored only as password hashes.
- Raw authentication and recovery tokens are never stored.
- Refresh tokens are rotated after successful use.
- Reusing a consumed refresh token may revoke its entire session.
- Authentication sessions can be revoked individually.
- A user may have at most one active email-verification token.
- A user may have at most one active password-reset token.
- Historical consumed and invalidated tokens are retained for security
  investigation and auditing.

## User statuses

- `PENDING_VERIFICATION`
- `ACTIVE`
- `LOCKED`
- `DEACTIVATED`

## Authorization roles

- `ROLE_USER`
- `ROLE_ADMIN`

## ER diagram

```mermaid
erDiagram
    USERS ||--o{ USER_ROLES : receives
    APPLICATION_ROLES ||--o{ USER_ROLES : assigns

    USERS ||--o{ AUTH_SESSIONS : authenticates
    AUTH_SESSIONS ||--o{ REFRESH_TOKENS : rotates

    USERS ||--o{ EMAIL_VERIFICATION_TOKENS : verifies
    USERS ||--o{ PASSWORD_RESET_TOKENS : resets

    USERS {
        uuid id PK
        varchar email UK
        varchar password_hash
        varchar first_name
        varchar last_name
        varchar status
        timestamptz email_verified_at
        integer failed_login_attempts
        timestamptz locked_until
        timestamptz last_login_at
        timestamptz created_at
        timestamptz updated_at
        bigint version
    }

    APPLICATION_ROLES {
        uuid id PK
        varchar code UK
        varchar name
        varchar description
        boolean system_role
        timestamptz created_at
    }

    USER_ROLES {
        uuid user_id PK
        uuid role_id PK
        timestamptz assigned_at
        uuid assigned_by_user_id
    }

    AUTH_SESSIONS {
        uuid id PK
        uuid user_id FK
        timestamptz created_at
        timestamptz last_seen_at
        timestamptz expires_at
        timestamptz revoked_at
        inet created_by_ip
        inet last_seen_ip
        varchar user_agent
    }

    REFRESH_TOKENS {
        uuid id PK
        uuid session_id FK
        uuid user_id FK
        varchar token_hash UK
        timestamptz issued_at
        timestamptz expires_at
        timestamptz consumed_at
        timestamptz revoked_at
        uuid replaced_by_token_id FK
    }

    EMAIL_VERIFICATION_TOKENS {
        uuid id PK
        uuid user_id FK
        varchar token_hash UK
        timestamptz expires_at
        timestamptz consumed_at
        timestamptz invalidated_at
    }

    PASSWORD_RESET_TOKENS {
        uuid id PK
        uuid user_id FK
        varchar token_hash UK
        timestamptz expires_at
        timestamptz consumed_at
        timestamptz invalidated_at
    }
```
