# Task 7: Define and Test TodoRepository Interface (TDD)

- Write tests for `TodoRepository` interface (`save`, `findById`, `findAll`, `update`, `delete`) in `tests/infrastructure/todoRepository.test.ts`, stubbing `FileSystem`.
- Define `TodoRepository` interface in `src/infrastructure/todoRepository.ts` with typed methods (e.g., `save(todo: Todo): Promise<void>`).
- Implement `JsonTodoRepository` in `src/infrastructure/jsonTodoRepository.ts` using `FileSystem` to manage JSON files in `data/todos.json`.
- Refactor for type safety and support for future storage formats (e.g., XML, CSV).
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
