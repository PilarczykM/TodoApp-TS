import { Todo } from '../../domain/todo';
import { TodoData } from '../../domain/todoValidator';
import { TodoRepository } from '../../interfaces/infrastructure/TodoRepository';
import { IdGenerator } from '../../interfaces/infrastructure/IdGenerator';
import { IErrorHandler } from '../../interfaces/application/IErrorHandler';
import {
  ITodoService,
  CreateTodoRequest,
  UpdateTodoRequest,
  TodoServiceResult,
} from '../../interfaces/application/ITodoService';

export class TodoService implements ITodoService {
  constructor(
    private readonly repository: TodoRepository,
    private readonly idGenerator: IdGenerator,
    private readonly errorHandler: IErrorHandler
  ) {}

  async createTodo(request: CreateTodoRequest): Promise<TodoServiceResult<Todo>> {
    try {
      const todoData: TodoData = {
        id: this.idGenerator.generate(),
        title: request.title,
        description: request.description,
        status: 'pending',
      };

      const todo = new Todo(todoData);
      await this.repository.save(todo);

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

  async getAllTodos(): Promise<TodoServiceResult<Todo[]>> {
    try {
      const todos = await this.repository.findAll();
      return {
        success: true,
        data: todos,
      };
    } catch (error) {
      const errorResult = this.errorHandler.handleError(error);
      return {
        success: false,
        error: errorResult.message,
      };
    }
  }

  async getTodoById(id: string): Promise<TodoServiceResult<Todo>> {
    try {
      const todo = await this.repository.findById(id);
      if (!todo) {
        return {
          success: false,
          error: 'Todo not found',
        };
      }

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

  async updateTodo(request: UpdateTodoRequest): Promise<TodoServiceResult<Todo>> {
    try {
      const existingTodo = await this.repository.findById(request.id);
      if (!existingTodo) {
        return {
          success: false,
          error: 'Todo not found',
        };
      }

      const updatedData: TodoData = {
        id: existingTodo.id,
        title: request.title ?? existingTodo.title,
        description: request.description ?? existingTodo.description,
        status: request.status ?? existingTodo.status,
      };

      const updatedTodo = new Todo(updatedData);
      await this.repository.update(updatedTodo);

      return {
        success: true,
        data: updatedTodo,
      };
    } catch (error) {
      const errorResult = this.errorHandler.handleError(error);
      return {
        success: false,
        error: errorResult.message,
      };
    }
  }

  async deleteTodo(id: string): Promise<TodoServiceResult<void>> {
    try {
      const existingTodo = await this.repository.findById(id);
      if (!existingTodo) {
        return {
          success: false,
          error: 'Todo not found',
        };
      }

      await this.repository.delete(id);
      return {
        success: true,
      };
    } catch (error) {
      const errorResult = this.errorHandler.handleError(error);
      return {
        success: false,
        error: errorResult.message,
      };
    }
  }

  async markTodoCompleted(id: string): Promise<TodoServiceResult<Todo>> {
    try {
      const existingTodo = await this.repository.findById(id);
      if (!existingTodo) {
        return {
          success: false,
          error: 'Todo not found',
        };
      }

      existingTodo.markAsCompleted();
      await this.repository.update(existingTodo);

      return {
        success: true,
        data: existingTodo,
      };
    } catch (error) {
      const errorResult = this.errorHandler.handleError(error);
      return {
        success: false,
        error: errorResult.message,
      };
    }
  }

  async markTodoPending(id: string): Promise<TodoServiceResult<Todo>> {
    try {
      const existingTodo = await this.repository.findById(id);
      if (!existingTodo) {
        return {
          success: false,
          error: 'Todo not found',
        };
      }

      existingTodo.markAsPending();
      await this.repository.update(existingTodo);

      return {
        success: true,
        data: existingTodo,
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
