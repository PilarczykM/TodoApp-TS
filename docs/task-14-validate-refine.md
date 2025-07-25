# Task 14: Validate and Refine

- Run all tests to ensure 100% coverage for critical paths.
- Verify linting and formatting with `npm run lint` and `npm run format`.
- Test CLI with real-world scenarios (e.g., add 10 todos, update 5, delete 3, simulate errors).
- Confirm Husky blocks commits with failing tests or linting errors.
- Verify TypeScript type checking with `tsc --noEmit`.
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
