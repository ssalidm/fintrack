# Contributing to FinTrack

Thank you for your interest in contributing to FinTrack.

FinTrack uses a pull-request-based workflow. Direct changes to protected
branches are not permitted.

## Branch structure

- `main` contains production-ready releases.
- `develop` contains integrated work for the next release.
- Short-lived branches are created from `develop`.

## Creating a working branch

Synchronise the local `develop` branch:

```bash
git switch develop
git pull --ff-only origin develop
