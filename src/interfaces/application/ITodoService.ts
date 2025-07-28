import { Todo } from '../../domain/todo';
import { TodoStatus } from '../../domain/types';

export type CreateTodoRequest = {
  title: string;
  description: string;
};

export type UpdateTodoRequest = {
  id: string;
  title?: string;
  description?: string;
  status?: TodoStatus;
};

export type TodoServiceResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export interface ITodoService {
  createTodo(request: CreateTodoRequest): Promise<TodoServiceResult<Todo>>;
  getAllTodos(): Promise<TodoServiceResult<Todo[]>>;
  getTodoById(id: string): Promise<TodoServiceResult<Todo>>;
  updateTodo(request: UpdateTodoRequest): Promise<TodoServiceResult<Todo>>;
  deleteTodo(id: string): Promise<TodoServiceResult<void>>;
  markTodoCompleted(id: string): Promise<TodoServiceResult<Todo>>;
  markTodoPending(id: string): Promise<TodoServiceResult<Todo>>;
}
