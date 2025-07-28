import { TodoRepository } from '../interfaces/infrastructure/TodoRepository';
import { IdGenerator } from '../interfaces/infrastructure/IdGenerator';
import { IErrorHandler } from '../interfaces/application/IErrorHandler';
import { Todo } from '../domain/todo';
import { TodoStatus } from '../domain/types';

export type ServiceResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type CreateTodoInput = {
  title: string;
  description: string;
  status: TodoStatus;
};

export type UpdateTodoInput = {
  title?: string;
  description?: string;
  status?: TodoStatus;
};

export class TodoService {
  constructor(
    private readonly todoRepository: TodoRepository,
    private readonly idGenerator: IdGenerator,
    private readonly errorHandler: IErrorHandler
  ) {}

  async createTodo(input: CreateTodoInput): Promise<ServiceResult<Todo>> {
    try {
      const id = this.idGenerator.generate();
      const todo = new Todo({
        id,
        title: input.title,
        description: input.description,
        status: input.status,
      });

      await this.todoRepository.save(todo);

      return {
        success: true,
        data: todo,
      };
    } catch (error) {
      return this.handleServiceError(error);
    }
  }

  async listTodos(): Promise<ServiceResult<Todo[]>> {
    try {
      const todos = await this.todoRepository.findAll();
      return {
        success: true,
        data: todos,
      };
    } catch (error) {
      return this.handleServiceError(error);
    }
  }

  async updateTodo(id: string, updates: UpdateTodoInput): Promise<ServiceResult<Todo>> {
    try {
      const existingTodo = await this.todoRepository.findById(id);
      if (!existingTodo) {
        return {
          success: false,
          error: 'Todo not found',
        };
      }

      const updatedTodo = new Todo({
        id: existingTodo.id,
        title: updates.title ?? existingTodo.title,
        description: updates.description ?? existingTodo.description,
        status: updates.status ?? existingTodo.status,
      });

      await this.todoRepository.update(updatedTodo);

      return {
        success: true,
        data: updatedTodo,
      };
    } catch (error) {
      return this.handleServiceError(error);
    }
  }

  async deleteTodo(id: string): Promise<ServiceResult<void>> {
    try {
      const existingTodo = await this.todoRepository.findById(id);
      if (!existingTodo) {
        return {
          success: false,
          error: 'Todo not found',
        };
      }

      await this.todoRepository.delete(id);

      return {
        success: true,
      };
    } catch (error) {
      return this.handleServiceError(error);
    }
  }

  private handleServiceError<T>(error: unknown): ServiceResult<T> {
    const errorResult = this.errorHandler.handleError(error);
    return {
      success: false,
      error: errorResult.message,
    };
  }
}
