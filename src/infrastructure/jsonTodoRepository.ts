import { Todo } from '../domain/todo';
import { TodoData } from '../domain/todoValidator';
import { FileSystem } from './fileSystem';
import { TodoRepository } from './todoRepository';

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
    await this.fileSystem.writeFile(this.filePath, JSON.stringify(todos, null, 2));
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

  async update(todo: Todo): Promise<void> {
    try {
      const todos = await this.readTodosFromFile();
      const todoIndex = todos.findIndex(t => t.id === todo.id);

      if (todoIndex === -1) {
        throw new Error('Todo not found');
      }

      todos[todoIndex] = todo.toData();
      await this.writeTodosToFile(todos);
    } catch (error) {
      if (error instanceof Error && error.message === 'Todo not found') {
        throw error;
      }
      throw new Error('Todo not found');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const todos = await this.readTodosFromFile();
      const todoIndex = todos.findIndex(t => t.id === id);

      if (todoIndex === -1) {
        throw new Error('Todo not found');
      }

      todos.splice(todoIndex, 1);
      await this.writeTodosToFile(todos);
    } catch (error) {
      if (error instanceof Error && error.message === 'Todo not found') {
        throw error;
      }
      throw new Error('Todo not found');
    }
  }
}
