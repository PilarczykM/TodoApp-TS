import { Todo } from '../../domain/todo';
import { TodoData } from '../../domain/todoValidator';
import { FileSystem } from '../../interfaces/infrastructure/FileSystem';
import { TodoRepository } from '../../interfaces/infrastructure/TodoRepository';
import { IErrorHandler } from '../../interfaces/application/IErrorHandler';

const JSON_FORMATTING = [null, 2] as const;
const ERROR_MESSAGES = {
  TODO_NOT_FOUND: 'Todo not found',
} as const;

export class JsonTodoRepository implements TodoRepository {
  private readonly filePath: string;
  private readonly dataDirectory: string;
  private readonly errorHandler?: IErrorHandler;

  constructor(
    private readonly fileSystem: FileSystem,
    errorHandlerOrFilePath?: IErrorHandler | string,
    filePath?: string
  ) {
    // Handle different constructor signatures for backward compatibility
    if (typeof errorHandlerOrFilePath === 'string') {
      // Legacy signature: (fileSystem, filePath)
      this.filePath = errorHandlerOrFilePath;
      this.errorHandler = undefined;
    } else {
      // New signature: (fileSystem, errorHandler, filePath?)
      this.errorHandler = errorHandlerOrFilePath;
      this.filePath = filePath || 'data/todos.json';
    }

    this.dataDirectory = this.filePath.split('/')[0];
  }

  private handleReadError(error: unknown): never {
    if (error instanceof SyntaxError) {
      throw error; // Re-throw JSON parsing errors
    }

    if (this.errorHandler) {
      const errorResult = this.errorHandler.handleError(error);
      throw new Error(errorResult.message);
    }

    throw new Error(ERROR_MESSAGES.TODO_NOT_FOUND);
  }

  private async readTodosFromFile(): Promise<TodoData[]> {
    try {
      const fileContent = await this.fileSystem.readFile(this.filePath);
      const parsed = JSON.parse(fileContent) as TodoData[];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw error; // Re-throw JSON parsing errors
      }

      // If ErrorHandler is available, let file system errors bubble up for proper handling
      // Otherwise, maintain backward compatibility by returning empty array
      if (this.errorHandler) {
        throw error;
      }

      return []; // File not found, return empty array (backward compatibility)
    }
  }

  private async writeTodosToFile(todos: TodoData[]): Promise<void> {
    await this.fileSystem.ensureDir(this.dataDirectory);
    await this.fileSystem.writeFile(this.filePath, JSON.stringify(todos, ...JSON_FORMATTING));
  }

  async save(todo: Todo): Promise<void> {
    const todos = await this.readTodosFromFile();
    todos.push(todo.toData());
    await this.writeTodosToFile(todos);
  }

  async findById(id: string): Promise<Todo | null> {
    try {
      const todos = await this.readTodosFromFile();
      const todoData = todos.find(todo => todo.id === id);

      if (todoData) {
        return new Todo(todoData);
      }

      return null;
    } catch (error) {
      this.handleReadOnlyError(error);
      return null; // File not found, return null
    }
  }

  async findAll(): Promise<Todo[]> {
    try {
      const todos = await this.readTodosFromFile();
      return todos.map(todoData => new Todo(todoData));
    } catch (error) {
      this.handleReadOnlyError(error);
      return []; // File not found, return empty array
    }
  }

  private handleReadOnlyError(error: unknown): void {
    if (error instanceof SyntaxError) {
      throw error; // Re-throw JSON parsing errors
    }
    // For other errors (like file not found), let the caller handle the return value
  }

  private findTodoIndex(todos: TodoData[], id: string): number {
    return todos.findIndex(t => t.id === id);
  }

  private ensureTodoExists(index: number): void {
    if (index === -1) {
      throw new Error(ERROR_MESSAGES.TODO_NOT_FOUND);
    }
  }

  async update(todo: Todo): Promise<void> {
    try {
      const todos = await this.readTodosFromFile();
      const todoIndex = this.findTodoIndex(todos, todo.id);
      this.ensureTodoExists(todoIndex);

      todos[todoIndex] = todo.toData();
      await this.writeTodosToFile(todos);
    } catch (error) {
      this.handleWriteOperationError(error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const todos = await this.readTodosFromFile();
      const todoIndex = this.findTodoIndex(todos, id);
      this.ensureTodoExists(todoIndex);

      todos.splice(todoIndex, 1);
      await this.writeTodosToFile(todos);
    } catch (error) {
      this.handleWriteOperationError(error);
    }
  }

  private handleWriteOperationError(error: unknown): never {
    if (error instanceof Error && error.message === ERROR_MESSAGES.TODO_NOT_FOUND) {
      throw error;
    }
    this.handleReadError(error);
  }
}
