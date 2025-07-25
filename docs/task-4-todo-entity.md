# Task 4: Define and Test Todo Entity and Validator (TDD)

- Write tests for the `Todo` entity (creation, immutability, status updates) in `tests/domain/todo.test.ts`, using TypeScript interfaces.
- Define `Todo` interface and implement `Todo` class in `src/domain/todo.ts` with properties: `id: string`, `title: string`, `description: string`, `status: 'pending' | 'completed'`.
- Write tests for `TodoValidator` (non-empty title, valid status transitions) in `tests/domain/todoValidator.test.ts`.
- Implement `TodoValidator` in `src/domain/todoValidator.ts` as a domain service with typed inputs/outputs.
- Refactor for clean code and type safety.
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
