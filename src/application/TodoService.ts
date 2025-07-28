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
  private static readonly TODO_NOT_FOUND = 'Todo not found';

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

      return this.createSuccessResult(todo);
    } catch (error) {
      return this.handleServiceError(error);
    }
  }

  async listTodos(): Promise<ServiceResult<Todo[]>> {
    try {
      const todos = await this.todoRepository.findAll();
      return this.createSuccessResult(todos);
    } catch (error) {
      return this.handleServiceError(error);
    }
  }

  async updateTodo(id: string, updates: UpdateTodoInput): Promise<ServiceResult<Todo>> {
    try {
      const validationError = await this.validateTodoExists(id);
      if (validationError) {
        return validationError as ServiceResult<Todo>;
      }

      const existingTodo = await this.todoRepository.findById(id);
      if (!existingTodo) {
        throw new Error('Todo should exist after validation');
      }

      const updatedTodo = this.mergeTodoUpdates(existingTodo, updates);

      await this.todoRepository.update(updatedTodo);

      return this.createSuccessResult(updatedTodo);
    } catch (error) {
      return this.handleServiceError(error);
    }
  }

  async deleteTodo(id: string): Promise<ServiceResult<void>> {
    try {
      const validationError = await this.validateTodoExists(id);
      if (validationError) {
        return validationError as ServiceResult<void>;
      }

      await this.todoRepository.delete(id);

      return this.createSuccessResult();
    } catch (error) {
      return this.handleServiceError(error);
    }
  }

  private async validateTodoExists(id: string): Promise<ServiceResult<never> | null> {
    const existingTodo = await this.todoRepository.findById(id);
    if (!existingTodo) {
      return {
        success: false,
        error: TodoService.TODO_NOT_FOUND,
      };
    }
    return null;
  }

  private createSuccessResult<T>(data?: T): ServiceResult<T> {
    return {
      success: true,
      data,
    };
  }

  private mergeTodoUpdates(existingTodo: Todo, updates: UpdateTodoInput): Todo {
    return new Todo({
      id: existingTodo.id,
      title: updates.title ?? existingTodo.title,
      description: updates.description ?? existingTodo.description,
      status: updates.status ?? existingTodo.status,
    });
  }

  private handleServiceError<T>(error: unknown): ServiceResult<T> {
    const errorResult = this.errorHandler.handleError(error);
    return {
      success: false,
      error: errorResult.message,
    };
  }
}
