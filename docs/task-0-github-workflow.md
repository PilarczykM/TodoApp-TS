# Task 0: Set Up GitHub Workflow (CI/CD)

## 🔧 Additional Information

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

---

## Task Details

- Create .github/workflows/ci.yml with:
  - Node.js environment setup.
  - Run npm install.
  - Run lint: npm run lint.
  - Run format check: npm run format.
  - Run tests: npm run test -- --coverage.
- Ensure workflow triggers on:
  - push to main and develop branches.
  - All pull_request events.
- Optional:
  - Add status badge to README.md.
  - Cache node_modules using actions/cache.

⚠️ WAIT FOR CONFIRMATION BEFORE PROCEEDING TO NEXT TASK