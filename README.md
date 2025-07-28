# TodoApp-TS

[![CI](https://github.com/marcinpilarczyk/TodoApp-TS/actions/workflows/ci.yml/badge.svg)](https://github.com/marcinpilarczyk/TodoApp-TS/actions/workflows/ci.yml)

A console-based Todo application built with Node.js and TypeScript, following Domain-Driven Design (DDD) principles, Test-Driven Development (TDD), and featuring a colorful interactive CLI interface with JSON storage support.

## Features

- ✅ **Interactive CLI Interface** - Colorful console interface with menu-driven navigation
- ✅ **Todo Management** - Create, read, update, delete, and manage todo items
- ✅ **Status Management** - Mark todos as completed or pending
- ✅ **JSON Storage** - Persistent storage with JSON format (extensible for XML, CSV)
- ✅ **Type Safety** - Full TypeScript implementation with strict typing
- ✅ **Domain-Driven Design** - Clean architecture with proper separation of concerns
- ✅ **Dependency Injection** - Abstracted I/O operations for better testability
- ✅ **Test-Driven Development** - Comprehensive test suite with Jest
- ✅ **Code Quality** - ESLint, Prettier, and Husky for consistent code standards
- ✅ **Error Handling** - Robust error handling with user-friendly messages

## Prerequisites

- **Node.js** (version 16 or higher)
- **npm** or **yarn** package manager

## Installation

1. Clone the repository:

```bash
git clone https://github.com/PilarczykM/TodoApp-TS.git
cd TodoApp-TS
```

2. Install dependencies:

```bash
npm install
```

3. Build the application:

```bash
npm run build
```

## Usage

### Starting the Application

To run the application in development mode:

```bash
npm run dev
```

To run the built application:

```bash
npm start
```

### CLI Commands

The application provides an interactive menu with the following options:

- **Create a new todo** - Add a new todo with title and description
- **List all todos** - Display all todos in a formatted table
- **Show a specific todo** - View details of a specific todo by ID
- **Update a todo** - Modify title or description of an existing todo
- **Delete a todo** - Remove a todo (with confirmation prompt)
- **Mark todo as completed** - Change status to completed
- **Mark todo as pending** - Change status to pending
- **Show help** - Display available commands and descriptions
- **Exit** - Close the application

### Example Usage

```bash
# Start the application
npm start

# The CLI will present you with a menu:
? What would you like to do? (Use arrow keys)
❯ Create a new todo
  List all todos
  Show a specific todo
  Update a todo
  Delete a todo
  Mark todo as completed
  Mark todo as pending
  Show help
  Exit
```

## Development Setup

### Development Workflow

1. Install dependencies:

```bash
npm install
```

2. Run in development mode with auto-reload:

```bash
npm run dev
```

3. Build the project:

```bash
npm run build
```

### Available Scripts

| Script               | Description                          |
| -------------------- | ------------------------------------ |
| `npm run build`      | Compile TypeScript to JavaScript     |
| `npm run dev`        | Run in development mode with nodemon |
| `npm start`          | Run the built application            |
| `npm test`           | Run the test suite                   |
| `npm run test:watch` | Run tests in watch mode              |
| `npm run lint`       | Run ESLint to check code quality     |
| `npm run lint:fix`   | Run ESLint with automatic fixes      |
| `npm run format`     | Format code with Prettier            |

## Testing

The project uses Jest for testing with comprehensive coverage:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm test -- --coverage
```

### Test Coverage

The project maintains high test coverage across all layers:

- **Domain Layer**: 100% coverage
- **Infrastructure Layer**: 95%+ coverage
- **Application Services**: 95%+ coverage
- **Overall Coverage**: 70%+ (with CLI integration tests)

### Test Structure

```
tests/
├── application/
│   ├── commandDispatcher.test.ts
│   ├── errorHandler.test.ts
│   └── todoService.test.ts
├── domain/
│   ├── todo.test.ts
│   └── todoValidator.test.ts
├── infrastructure/
│   ├── consoleInterface.test.ts
│   ├── fileSystem.test.ts
│   ├── idGenerator.test.ts
│   └── todoRepository.test.ts
└── interfaces/
    └── cli.test.ts
```

## Code Quality

### Linting and Formatting

The project uses ESLint and Prettier for consistent code quality:

- **ESLint**: TypeScript-specific rules with strict type checking
- **Prettier**: Automatic code formatting
- **Husky**: Git hooks for pre-commit quality checks

### Pre-commit Hooks

Husky runs the following checks before each commit:

- ESLint for code quality
- Prettier for formatting
- TypeScript compilation check
- Test suite execution

## Project Structure

```
src/
├── application/
│   └── services/
│       ├── CommandDispatcher.ts    # Command pattern implementation
│       ├── ErrorHandler.ts         # Centralized error handling
│       └── TodoService.ts          # Main business logic service
├── domain/
│   ├── todo.ts                     # Todo entity
│   ├── todoValidator.ts            # Domain validation
│   ├── types.ts                    # Type definitions
│   └── validationError.ts          # Domain errors
├── infrastructure/
│   ├── console/
│   │   └── InquirerConsole.ts      # Console I/O implementation
│   ├── fileSystem/
│   │   └── FsExtraFileSystem.ts    # File system abstraction
│   ├── idGeneration/
│   │   └── UuidIdGenerator.ts      # ID generation service
│   └── repositories/
│       └── JsonTodoRepository.ts   # JSON storage implementation
├── interfaces/
│   ├── application/                # Application interfaces
│   ├── infrastructure/             # Infrastructure interfaces
│   ├── cli/
│   │   └── TodoCLI.ts             # CLI implementation
│   └── cli.ts                     # Application entry point
└── index.ts                       # Main export file
```

## Architecture

### Domain-Driven Design

The application follows DDD principles with clear separation:

- **Domain Layer**: Core business logic and entities (`Todo`, `TodoValidator`)
- **Application Layer**: Use cases and services (`TodoService`, `CommandDispatcher`)
- **Infrastructure Layer**: External concerns (file system, console, ID generation)
- **Interface Layer**: User interfaces (CLI)

### Dependency Injection

All external dependencies are injected through interfaces:

- `FileSystem` interface for file operations
- `IdGenerator` interface for unique ID creation
- `TodoRepository` interface for data persistence
- `ConsoleInterface` interface for user interaction

### Storage Flexibility

The repository pattern allows easy extension to other storage formats:

- Current: JSON format via `JsonTodoRepository`
- Future: XML, CSV, or database implementations by implementing `TodoRepository`

## Technology Stack

### Core Dependencies

- **chalk**: Colorful console output
- **inquirer**: Interactive CLI prompts
- **fs-extra**: Enhanced file system operations
- **uuid**: Unique identifier generation

### Development Dependencies

- **TypeScript**: Static type checking
- **Jest**: Testing framework with `ts-jest` for TypeScript support
- **ESLint**: Code linting with TypeScript rules
- **Prettier**: Code formatting
- **Husky**: Git hooks
- **nodemon**: Development auto-reload
- **ts-node**: TypeScript execution

## Contributing

### Development Guidelines

1. **Follow TDD**: Write tests before implementation
2. **Maintain Type Safety**: Use strict TypeScript settings
3. **Follow Clean Code**: Keep functions small and focused
4. **Use Dependency Injection**: Abstract external dependencies
5. **Write Self-Documenting Code**: Clear variable and function names

### Git Workflow

1. Create a feature branch from `main`
2. Make your changes following the coding standards
3. Ensure all tests pass and coverage is maintained
4. Run linting and formatting checks
5. Submit a pull request with descriptive commit messages

### Commit Message Format

Use conventional commit format:

```
type(scope): description

Examples:
feat(cli): add todo completion command
fix(domain): validate todo status correctly
test(service): add error handling tests
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Marcin Pilarczyk

## Repository

- **GitHub**: [https://github.com/PilarczykM/TodoApp-TS](https://github.com/PilarczykM/TodoApp-TS)
- **Issues**: [https://github.com/PilarczykM/TodoApp-TS/issues](https://github.com/PilarczykM/TodoApp-TS/issues)
