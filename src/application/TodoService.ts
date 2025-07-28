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
      const errorResult = this.errorHandler.handleError(error);
      return {
        success: false,
        error: errorResult.message,
      };
    }
  }
}