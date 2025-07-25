# Task 12: Enhance Code Quality Checks

- Configure ESLint with `@typescript-eslint` for TypeScript-specific rules.
- Set up Prettier for auto-formatting on save.
- Configure Husky to run `eslint`, `prettier --check`, and `jest` before commits.
- Add CI configuration (e.g., GitHub Actions) to run tests and linting on push.
- **⚠️ WAIT FOR CONFIRMATION BEFORE PROCEEDING TO NEXT TASK**

# 🔧 Additional Information

**Branch Strategy**:

- Use conventional branch naming:
  - `feat/` - new features (e.g., `feat/domain-layer`)
  - `docs/` - documentation updates (e.g., `docs/readme-update`)
  - `test/` - test-related changes (e.g., `test/integration-tests`)
  - `fix/` - bug fixes (e.g., `fix/validation-error`)
  - `refactor/` - code refactoring (e.g., `refactor/repository-pattern`)
  - `chore/` - maintenance tasks (e.g., `chore/ci-setup`)

**Commit Strategy**:

- Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):
  - Example: `feat: add TodoItem model with validation`
  - Example: `test: add unit tests for repository layer`

**Task Execution**:

- **⚠️ WAIT FOR CONFIRMATION BEFORE PROCEEDING TO NEXT TASK** (after each major task)
- Always follow TDD strategy. (Test, Code, Refactor)!
- Run relevant tests after completing each subtask to ensure stability
