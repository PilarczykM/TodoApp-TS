import { Todo } from '../../src/domain/todo';
import { TodoStatus } from '../../src/domain/todoValidator';
import { ValidationError } from '../../src/domain/validationError';

describe('Todo', () => {
  const validTodoData = {
    id: '123',
    title: 'Buy groceries',
    description: 'Need to buy milk and bread',
    status: 'pending' as TodoStatus,
  };

  describe('constructor', () => {
    it('should create a todo with valid data', () => {
      const todo = new Todo(validTodoData);

      expect(todo.id).toBe('123');
      expect(todo.title).toBe('Buy groceries');
      expect(todo.description).toBe('Need to buy milk and bread');
      expect(todo.status).toBe('pending');
    });

    it('should throw ValidationError for invalid title', () => {
      const invalidData = { ...validTodoData, title: '' };

      expect(() => new Todo(invalidData)).toThrow(ValidationError);
      expect(() => new Todo(invalidData)).toThrow('Invalid Todo data');
    });

    it('should throw ValidationError for whitespace-only title', () => {
      const invalidData = { ...validTodoData, title: '   ' };

      expect(() => new Todo(invalidData)).toThrow(ValidationError);
      expect(() => new Todo(invalidData)).toThrow('Invalid Todo data');
    });

    it('should throw ValidationError for invalid status', () => {
      const invalidData = { ...validTodoData, status: 'invalid' as any };

      expect(() => new Todo(invalidData)).toThrow(ValidationError);
      expect(() => new Todo(invalidData)).toThrow('Invalid Todo data');
    });

    it('should throw ValidationError with multiple validation messages', () => {
      const invalidData = { ...validTodoData, title: '', status: 'invalid' as any };

      expect(() => new Todo(invalidData)).toThrow(ValidationError);
      expect(() => new Todo(invalidData)).toThrow('Invalid Todo data');
    });
  });

  describe('property immutability', () => {
    it('should have readonly properties (TypeScript compile-time protection)', () => {
      const todo = new Todo(validTodoData);

      // TypeScript provides compile-time protection for readonly properties
      // At runtime, these properties are accessible but should not be modified
      expect(todo.id).toBe('123');
      expect(todo.title).toBe('Buy groceries');
      expect(todo.description).toBe('Need to buy milk and bread');
      expect(todo.status).toBe('pending');
    });
  });

  describe('updateStatus', () => {
    it('should update status from pending to completed', () => {
      const todo = new Todo(validTodoData);

      todo.updateStatus('completed');

      expect(todo.status).toBe('completed');
    });

    it('should update status from completed to pending', () => {
      const completedTodo = new Todo({ ...validTodoData, status: 'completed' });

      completedTodo.updateStatus('pending');

      expect(completedTodo.status).toBe('pending');
    });

    it('should throw ValidationError for invalid status', () => {
      const todo = new Todo(validTodoData);

      expect(() => todo.updateStatus('invalid' as any)).toThrow(ValidationError);
      expect(() => todo.updateStatus('invalid' as any)).toThrow('Invalid status');
    });
  });

  describe('toData', () => {
    it('should return todo data as plain object', () => {
      const todo = new Todo(validTodoData);

      const data = todo.toData();

      expect(data).toEqual({
        id: '123',
        title: 'Buy groceries',
        description: 'Need to buy milk and bread',
        status: 'pending',
      });
    });

    it('should return immutable data object', () => {
      const todo = new Todo(validTodoData);
      const data = todo.toData();

      data.title = 'Modified title';

      expect(todo.title).toBe('Buy groceries');
    });
  });

  describe('isCompleted', () => {
    it('should return true for completed todo', () => {
      const completedTodo = new Todo({ ...validTodoData, status: 'completed' });

      expect(completedTodo.isCompleted()).toBe(true);
    });

    it('should return false for pending todo', () => {
      const pendingTodo = new Todo(validTodoData);

      expect(pendingTodo.isCompleted()).toBe(false);
    });
  });

  describe('markAsCompleted', () => {
    it('should mark pending todo as completed', () => {
      const todo = new Todo(validTodoData);

      todo.markAsCompleted();

      expect(todo.status).toBe('completed');
      expect(todo.isCompleted()).toBe(true);
    });

    it('should not throw error if already completed', () => {
      const completedTodo = new Todo({ ...validTodoData, status: 'completed' });

      expect(() => completedTodo.markAsCompleted()).not.toThrow();
      expect(completedTodo.status).toBe('completed');
    });
  });

  describe('markAsPending', () => {
    it('should mark completed todo as pending', () => {
      const completedTodo = new Todo({ ...validTodoData, status: 'completed' });

      completedTodo.markAsPending();

      expect(completedTodo.status).toBe('pending');
      expect(completedTodo.isCompleted()).toBe(false);
    });

    it('should not throw error if already pending', () => {
      const pendingTodo = new Todo(validTodoData);

      expect(() => pendingTodo.markAsPending()).not.toThrow();
      expect(pendingTodo.status).toBe('pending');
    });
  });
});
