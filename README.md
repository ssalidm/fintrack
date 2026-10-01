# Fintrack

Fintrack is a secure full-stack personal finance management platform for
tracking financial accounts, income, expenses, transfers, budgets,
recurring transactions and savings goals.

## Current release

**Version:** 2.0.0

Fintrack 2.0 introduces a new email-first registration flow and version 2
of the REST API.

### API

The current API base path is:

```text
/api/v2
```
Local registration now uses a two-step email-first flow:

```text
POST /api/v2/auth/registration/start
POST /api/v2/auth/registration/complete
```
The legacy endpoint below was removed in version 2.0:
```text
POST /api/v1/auth/register
```
See [CHANGELOG.md](CHANGELOG.md) for release details and breaking changes.

## Project status
Fintrack is under active development and includes a functional backend,
frontend, database migrations, automated integration tests and API
documentation.

## Technology Stack
### Backend

- Java
- Spring Boot
- Spring Security
- PostgreSQL
- Flyway
- Maven
- Testcontainers

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

### Engineering

- Docker and Docker Compose
- GitHub Actions
- REST API
- Automated testing
- OpenAPI documentation

## Repository structure

```text
fintrack/
├── backend/
├── frontend/
├── database/
├── docs/
└── .github/
```
## Branch strategy

- `main` contains production-ready releases.
- `develop` contains integrated development work.
- `feature/*` branches contain new functionality.
- `fix/*` branches contain bug fixes.
- `chore/*` branches contain maintenance work.
- `docs/*` branches contain documentation changes.

## Development status

Fintrack has progressed beyond initial setup and architecture into active
feature development, integration testing, security hardening and
production-oriented refinement.

## Project objectives

FinTrack is being developed to demonstrate secure full-stack engineering,
database design, automated testing, CI/CD, and production deployment.

## Author

David Ssali
