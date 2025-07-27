import { Todo } from '../../src/domain/todo';
import { TodoData, TodoStatus } from '../../src/domain/todoValidator';
import { ValidationError } from '../../src/domain/validationError';

describe('Todo', () => {
  const createValidTodoData = (overrides: Partial<TodoData> = {}): TodoData => ({
    id: '123',
    title: 'Buy groceries',
    description: 'Need to buy milk and bread',
    status: 'pending',
    ...overrides,
  });

  describe('constructor', () => {
    it('should create a todo with valid data', () => {
      const todoData = createValidTodoData();
      const todo = new Todo(todoData);

      expect(todo.id).toBe(todoData.id);
      expect(todo.title).toBe(todoData.title);
      expect(todo.description).toBe(todoData.description);
      expect(todo.status).toBe(todoData.status);
    });

    it.each([
      [{ title: '' }, 'Invalid Todo data'],
      [{ title: '   ' }, 'Invalid Todo data'],
      [{ status: 'invalid' as any }, 'Invalid Todo data'],
      [{ title: '', status: 'invalid' as any }, 'Invalid Todo data'],
    ])('should throw ValidationError for invalid data: %p', (overrides, expectedError) => {
      const invalidData = createValidTodoData(overrides);

      expect(() => new Todo(invalidData)).toThrow(ValidationError);
      expect(() => new Todo(invalidData)).toThrow(expectedError);
    });
  });

  describe('updateStatus', () => {
    it.each<[TodoStatus, TodoStatus]>([
      ['pending', 'completed'],
      ['completed', 'pending'],
    ])('should update status from %s to %s', (initialStatus, newStatus) => {
      const todo = new Todo(createValidTodoData({ status: initialStatus }));
      todo.updateStatus(newStatus);
      expect(todo.status).toBe(newStatus);
    });

    it('should throw ValidationError for invalid status', () => {
      const todo = new Todo(createValidTodoData());

      expect(() => todo.updateStatus('invalid' as any)).toThrow(ValidationError);
      expect(() => todo.updateStatus('invalid' as any)).toThrow('Invalid status');
    });
  });

  describe('isCompleted', () => {
    it.each([
      ['completed', true],
      ['pending', false],
    ])('should return %s when status is %s', (status, expected) => {
      const todo = new Todo(createValidTodoData({ status: status as TodoStatus }));
      expect(todo.isCompleted()).toBe(expected);
    });
  });

  describe('toggling status', () => {
    it('should mark pending todo as completed', () => {
      const todo = new Todo(createValidTodoData({ status: 'pending' }));
      todo.markAsCompleted();
      expect(todo.status).toBe('completed');
    });

    it('should mark completed todo as pending', () => {
      const todo = new Todo(createValidTodoData({ status: 'completed' }));
      todo.markAsPending();
      expect(todo.status).toBe('pending');
    });
  });
});
