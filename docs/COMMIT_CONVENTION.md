# FinTrack Commit Convention

FinTrack uses structured commit messages to keep the project history readable.

## Format

```text
<type>(optional-scope): description
```

The scope identifies the affected area and may be omitted.

## Supported types

| Type       | Purpose                                       |
| ---------- | --------------------------------------------- |
| `feat`     | Introduces user-facing functionality          |
| `fix`      | Corrects defective behaviour                  |
| `test`     | Adds or changes tests                         |
| `docs`     | Changes documentation only                    |
| `refactor` | Restructures code without changing behaviour  |
| `chore`    | Performs project maintenance                  |
| `ci`       | Changes continuous-integration configuration  |
| `build`    | Changes build configuration or dependencies   |
| `perf`     | Improves performance                          |
| `style`    | Changes formatting without changing behaviour |

## Examples

```text
feat(auth): add user registration
feat(accounts): add account archive operation
fix(transactions): reject zero-value transactions
test(transfers): verify rollback on destination failure
refactor(reporting): extract monthly summary mapper
docs: add local setup instructions
ci: run backend tests on pull requests
build(frontend): add Tailwind dependency
```
## Description rules

The description should:

- Be concise
- Use lowercase after the colon
- Use the imperative mood
- Describe one logical change
- Not end with a full stop

Prefer:
```text
fix(accounts): prevent duplicate account names
```

Avoid:
```text
Fixed some account stuff.
```
## Breaking changes

A breaking change must be clearly identified:

```text
feat(api)!: change transaction response structure
```

The commit body should explain the effect:

```text
BREAKING CHANGE: transaction responses now use the standard API envelope.
```

Breaking changes require explicit review because they may affect the frontend,
API consumers, tests, and deployment process.
