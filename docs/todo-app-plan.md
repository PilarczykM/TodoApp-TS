# ✅ Console TODO Application (TDD, DDD, Modular)

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

## ✅ MAIN TASK PLAN

### 0. Set Up GitHub Workflow (CI/CD)
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

### 1. Project Initialization
- Create project directory (`todo-app`), run `npm init -y`.
- Install dependencies: `chalk`, `inquirer`, `fs-extra`, `uuid`, `jest`, `eslint`, `prettier`, `husky`, `nodemon`.
- Set up `.gitignore` and initial Git repo.

**⚠️ WAIT FOR CONFIRMATION BEFORE PROCEEDING TO NEXT TASK**

### 2. Configure Development Environment
- Set up ESLint with Airbnb config.
- Configure Prettier rules (single quotes, max line length 80).
- Enable Husky to run pre-commit hooks: `eslint`, `prettier --check`, `jest`.
- Add NPM scripts: `start`, `test`, `lint`, `format`, `dev`.
- Configure Jest for ES modules and coverage reporting.

**⚠️ WAIT FOR CONFIRMATION BEFORE PROCEEDING TO NEXT TASK**

### 3. Define Project Structure (DDD Layout)
- Create the following folders:
  - `src/domain`
  - `src/application`
  - `src/infrastructure`
  - `src/interfaces`
  - `src/shared`
  - `tests/`
  - `data/`

**⚠️ WAIT FOR CONFIRMATION BEFORE PROCEEDING TO NEXT TASK**

### 4. Define and Test Todo Entity (TDD)
- Write unit tests for `Todo` entity (create, update status).
- Implement `Todo` in `src/domain/todo.js`.
- Create `TodoValidator` in `src/domain/todoValidator.js` to encapsulate validation logic.
- Write unit tests for `TodoValidator`.

**⚠️ WAIT FOR CONFIRMATION BEFORE PROCEEDING TO NEXT TASK**

### 5. Define and Test IdGenerator Interface (TDD)
- Create interface for ID generation: `IdGenerator`.
- Write unit tests in `tests/infrastructure/idGenerator.test.js`.
- Implement `UuidIdGenerator` using `uuid`.

**⚠️ WAIT FOR CONFIRMATION BEFORE PROCEEDING TO NEXT TASK**

### 6. Define and Test FileSystem Interface (TDD)
- Create a `FileSystem` interface with methods: `readFile`, `writeFile`, `ensureDir`.
- Write tests using mocks/stubs.
- Implement `FsExtraFileSystem` using `fs-extra`.

**⚠️ WAIT FOR CONFIRMATION BEFORE PROCEEDING TO NEXT TASK**

### 7. Define and Test TodoRepository Interface (TDD)
- Interface: `TodoRepository` with methods `save`, `findById`, `findAll`, `update`, `delete`.
- Write tests stubbing `FileSystem`.
- Implement `JsonTodoRepository` using `FileSystem` and JSON file.

**⚠️ WAIT FOR CONFIRMATION BEFORE PROCEEDING TO NEXT TASK**

### 8. Define and Test TodoService (TDD)
- Create `TodoService` with business orchestration (CRUD logic).
- Inject `TodoRepository`, `IdGenerator`, `TodoValidator`.
- Write tests mocking dependencies.

**⚠️ WAIT FOR CONFIRMATION BEFORE PROCEEDING TO NEXT TASK**

### 9. Define and Test ConsoleInterface (TDD)
- Interface: `ConsoleInterface` with methods like `prompt()`, `display()`.
- Write unit tests stubbing input/output.
- Implement `InquirerConsole` using `chalk` and `inquirer`.

**⚠️ WAIT FOR CONFIRMATION BEFORE PROCEEDING TO NEXT TASK**

### 10. Integrate CLI with TodoService (TDD)
- Create `CommandDispatcher` in `src/interfaces/commandDispatcher.js` to route commands like `add`, `list`, `delete`, etc.
- CLI entry (`cli.js`) handles prompt, passes to dispatcher.
- Write tests for CLI + dispatcher integration.

**⚠️ WAIT FOR CONFIRMATION BEFORE PROCEEDING TO NEXT TASK**

### 11. Test End-to-End Functionality (TDD)
- Write integration tests connecting `cli` → `service` → `repository`.
- Simulate edge cases (e.g., file errors, invalid input).
- Implement basic `ErrorHandler` in `src/shared/errorHandler.js` to catch and report errors.

**⚠️ WAIT FOR CONFIRMATION BEFORE PROCEEDING TO NEXT TASK**

### 12. Enhance Code Quality Checks
- Confirm ESLint rules are enforced across all files.
- Enable auto-formatting via Prettier on save.
- Ensure Husky blocks commits with lint/test failures.
- Run coverage reports with Jest.

**⚠️ WAIT FOR CONFIRMATION BEFORE PROCEEDING TO NEXT TASK**

### 13. Optimize Developer Experience
- Use `nodemon` for local development.
- Add `.env` support if needed for file paths/configs.
- Add logging or debug mode toggle if applicable.

**⚠️ WAIT FOR CONFIRMATION BEFORE PROCEEDING TO NEXT TASK**

### 14. Validate and Refine
- Run full suite: lint, format, test, coverage.
- Test real-world scenarios (create 10 todos, delete 3, update 2).
- Check for clean CLI output, color usage, proper command flow.

**⚠️ WAIT FOR CONFIRMATION BEFORE PROCEEDING TO NEXT TASK**

### 15. Prepare for Future Extensions
- Document how to:
  - Replace `FileSystem` (e.g., XML)
  - Swap `ConsoleInterface` or `IdGenerator`
  - Add new commands via `CommandDispatcher`
  - Extend validation rules
- Confirm interfaces make future migrations easy.

**⚠️ WAIT FOR CONFIRMATION BEFORE PROCEEDING TO NEXT TASK**

### 16. Finalize and Document
- Polish `README.md`: setup, usage, commands, architecture overview.
- Add “Contributing” guide.
- Optional: Package CLI with bin entry in `package.json`.

**⚠️ WAIT FOR CONFIRMATION BEFORE PROCEEDING TO NEXT TASK**
