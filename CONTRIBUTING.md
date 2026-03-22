# Contributing to GlassesTryON

Thank you for your interest in contributing to GlassesTryON. This document outlines how to get involved, set up your development environment, and submit changes.

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before participating. By contributing, you agree to abide by its terms.

---

## Ways to Contribute

- **Bug reports** — Open a GitHub issue describing the problem, steps to reproduce, and your environment.
- **Feature requests** — Open a GitHub issue with a clear description of the proposed feature and its use case.
- **Pull requests** — Fix a bug, implement a feature, or improve performance. See the workflow below.
- **Documentation** — Improve README files, inline code comments, or usage examples.

---

## Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- [pnpm](https://pnpm.io/) 9 or later

### Getting Started

```bash
git clone https://github.com/your-org/glasses-tryon.git
cd glasses-tryon
pnpm install
```

### Common Commands

| Command              | Description                    |
| -------------------- | ------------------------------ |
| `pnpm build`         | Build all packages             |
| `pnpm test`          | Run all tests                  |
| `pnpm test:coverage` | Run tests with coverage report |
| `pnpm lint`          | Lint all packages              |
| `pnpm format`        | Format code with Prettier      |

### Package-Scoped Commands

```bash
# Run tests for a specific package
pnpm --filter glasses-tryon-core test
pnpm --filter glasses-tryon-react test

# Build a specific package
pnpm --filter glasses-tryon-core build
pnpm --filter glasses-tryon-react build
```

---

## Branch Strategy

- `main` — production-ready code; **never push directly to `main`**
- `develop` — integration branch; all feature branches are based off here
- Feature branches — use the `feat/my-feature` naming convention, branched from `develop`

**All pull requests must target `develop`**, not `main`. The `main` branch is updated only through the release process managed by release-please.

```bash
# Create a feature branch
git checkout develop
git pull origin develop
git checkout -b feat/my-feature
```

---

## Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/). Commit messages are used by [release-please](https://github.com/googleapis/release-please) to determine version bumps and generate changelogs automatically.

### Commit Types

| Type        | Version Bump    | When to Use                                           |
| ----------- | --------------- | ----------------------------------------------------- |
| `feat:`     | Minor (`1.x.0`) | A new feature                                         |
| `fix:`      | Patch (`1.0.x`) | A bug fix                                             |
| `chore:`    | None            | Maintenance tasks, dependency updates                 |
| `docs:`     | None            | Documentation changes only                            |
| `test:`     | None            | Adding or updating tests                              |
| `ci:`       | None            | CI/CD configuration changes                           |
| `refactor:` | None            | Code changes that neither fix a bug nor add a feature |

> **Important:** To trigger a version bump via release-please, your commit must touch files inside `packages/core/` or `packages/react/`. Commits that only modify root-level files will not trigger a release.

### Format

```
<type>(<scope>): <short description>
```

### Examples

```
feat(core): add pupillary distance calibration
fix(react): correct cleanup on unmount
docs(core): update API reference for FaceDetector
test(react): add coverage for hook edge cases
chore: update pnpm lockfile
```

### Breaking Changes

For breaking changes, add `!` after the type/scope and include a `BREAKING CHANGE:` footer:

```
feat(core)!: rename initialize() to setup()

BREAKING CHANGE: The `initialize` export has been renamed to `setup`.
```

---

## Pull Request Checklist

Before submitting a PR, verify the following:

- [ ] All tests pass (`pnpm test`)
- [ ] Code coverage is at or above 60% (`pnpm test:coverage`)
- [ ] No linting errors (`pnpm lint`)
- [ ] Code is formatted (`pnpm format`)
- [ ] Commit message(s) follow the Conventional Commits format
- [ ] PR targets the `develop` branch
- [ ] PR description explains the change and links to any related issue

---

## Testing

Tests are co-located with source files. Coverage reports are generated with Vitest.

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests for a single package
pnpm --filter glasses-tryon-core test
pnpm --filter glasses-tryon-react test
```

The minimum required coverage threshold is **60%**. PRs that drop coverage below this threshold will not be merged.

---

## Release Process (Maintainers)

This project uses [release-please](https://github.com/googleapis/release-please) for automated releases.

1. Merging conventional commits into `main` causes release-please to open a Release PR automatically.
2. The Release PR contains a bumped version and an updated `CHANGELOG.md`.
3. Merging the Release PR triggers the publish workflow, which publishes the updated packages to npm.

Maintainers should not manually edit `CHANGELOG.md` or bump versions in `package.json` — release-please handles this.
