import { Todo } from '../../domain/todo';

export interface TodoRepository {
  save(todo: Todo): Promise<void>;
  findById(id: string): Promise<Todo | null>;
  findAll(): Promise<Todo[]>;
  update(todo: Todo): Promise<void>;
  delete(id: string): Promise<void>;
}
