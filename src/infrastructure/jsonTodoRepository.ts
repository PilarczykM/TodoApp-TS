import { Todo } from '../domain/todo';
import { TodoData } from '../domain/todoValidator';
import { FileSystem } from './fileSystem';
import { TodoRepository } from './todoRepository';

const JSON_FORMATTING = [null, 2] as const;
const ERROR_MESSAGES = {
  TODO_NOT_FOUND: 'Todo not found',
} as const;

export class JsonTodoRepository implements TodoRepository {
  private readonly filePath: string;
  private readonly dataDirectory: string;

  constructor(
    private readonly fileSystem: FileSystem,
    filePath: string = 'data/todos.json'
  ) {
    this.filePath = filePath;
    this.dataDirectory = filePath.split('/')[0];
  }

  private handleReadError(error: unknown): never {
    if (error instanceof SyntaxError) {
      throw error; // Re-throw JSON parsing errors
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
      return []; // File not found, return empty array
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
      if (error instanceof SyntaxError) {
        throw error; // Re-throw JSON parsing errors
      }
      return null; // File not found, return null
    }
  }

  async findAll(): Promise<Todo[]> {
    try {
      const todos = await this.readTodosFromFile();
      return todos.map(todoData => new Todo(todoData));
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw error; // Re-throw JSON parsing errors
      }
      return []; // File not found, return empty array
    }
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
      if (error instanceof Error && error.message === ERROR_MESSAGES.TODO_NOT_FOUND) {
        throw error;
      }
      this.handleReadError(error);
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
      if (error instanceof Error && error.message === ERROR_MESSAGES.TODO_NOT_FOUND) {
        throw error;
      }
      this.handleReadError(error);
    }
  }
}
