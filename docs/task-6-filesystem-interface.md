# Task 6: Define and Test FileSystem Interface (TDD)

- Write tests for `FileSystem` interface (`readFile`, `writeFile`, `ensureDir`) in `tests/infrastructure/fileSystem.test.ts`, stubbing file operations.
- Define `FileSystem` interface in `src/infrastructure/fileSystem.ts` with typed methods (e.g., `readFile(path: string): Promise<string>`).
- Implement `FsExtraFileSystem` using `fs-extra` in `src/infrastructure/fsExtraFileSystem.ts`.
- Refactor for flexibility and TypeScript compliance.
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