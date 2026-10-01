# Changelog

All notable changes to Salif will be documented in this file.

## [2.0.0] - 2026-10-01

### Breaking Changes

- Changed the API base path from `/api/v1` to `/api/v2`.
- Removed the legacy `POST /auth/register` endpoint.
- Replaced single-step registration with the email-first registration flow:
    - `POST /auth/registration/start`
    - `POST /auth/registration/complete`
- API consumers using the v1 registration contract must migrate to the new two-step registration flow.

### Added

- Email-first account registration with expiring, single-use registration tokens.
- Registration request invalidation when a new registration request is issued.
- Protection against account enumeration during registration.
- Explicit application-wide clock handling for deterministic time-sensitive behaviour.

### Changed

- Registration now verifies email ownership before creating a local account.
- Newly completed registrations are created as active, verified users.
- JWT timestamp and session validation now use the application clock consistently.
- Reporting persistence now returns persistence-specific rows instead of API response DTOs.
- Identity and finance exception handling is separated by bounded context.
- Finance and identity services now use the configured application clock instead of direct system-time access.
- Integration-test identity fixtures now use the current registration flow rather than the removed legacy endpoint.
- Migrated production profile avatar storage from the local filesystem to **Cloudflare R2**.
- Added configurable profile image storage with filesystem and R2 implementations.
- Updated USD currency formatting to display `$` instead of `US$`.

### Fixed

- Corrected transaction account validation to use the appropriate inactive-account exception.
- Corrected the transaction sort property from `CreatedAt` to `createdAt`.
- Fixed JWT expiry validation when integration tests use a fixed application clock.
- Improved dark-mode support across account forms, transaction dialogs, authentication dialogs, profile dialogs, and admin access states.
- Fixed support form submission when valid email addresses contain surrounding whitespace.

### Removed

- Legacy `UserRegistrationService`.
- Legacy `DefaultUserRegistrationService`.
- Legacy `RegisterRequest` and `RegisterResponse` API models.
- Legacy `/auth/register` frontend API client.
- Obsolete shared `Util` helper.
- Legacy registration integration tests tied to the removed endpoint.

### Internal

- Cleaned package boundaries between identity, finance, transfer, and reporting modules.
- Removed API-layer dependencies from reporting persistence.
- Made domain timestamps explicit where business operations require them.
- Consolidated shared optimistic-lock version checks.
