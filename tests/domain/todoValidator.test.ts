import { TodoValidator, TodoData } from '../../src/domain/todoValidator';

describe('TodoValidator', () => {
  describe('validateTitle', () => {
    it('should return true for valid titles', () => {
      expect(TodoValidator.validateTitle('Buy groceries')).toBe(true);
    });
    it('should return false for invalid titles', () => {
      expect(TodoValidator.validateTitle('')).toBe(false);
      expect(TodoValidator.validateTitle('   ')).toBe(false);
      expect(TodoValidator.validateTitle(null as any)).toBe(false);
      expect(TodoValidator.validateTitle(undefined as any)).toBe(false);
    });
  });

  describe('validateStatus', () => {
    it.each([
      ['pending', true],
      ['completed', true],
      ['invalid', false],
      ['done', false],
      ['todo', false],
      ['', false],
      [null, false],
      [undefined, false],
    ])('should return %s for status: %p', (status, expected) => {
      expect(TodoValidator.validateStatus(status as any)).toBe(expected);
    });
  });

  describe('validateTodoData', () => {
    const createValidTodoData = (overrides: Partial<TodoData> = {}): TodoData => ({
      id: '123',
      title: 'Test todo',
      description: 'Test description',
      status: 'pending',
      ...overrides,
    });

    it('should return valid for complete todo data', () => {
      const result = TodoValidator.validateTodoData(createValidTodoData());
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it.each<[Partial<TodoData>, string[]]>([
      [{ title: '' }, ['Title cannot be empty']],
      [{ status: 'invalid' as any }, ['Status must be either "pending" or "completed"']],
      [
        { title: '', status: 'invalid' as any },
        ['Title cannot be empty', 'Status must be either "pending" or "completed"'],
      ],
    ])('should return errors for invalid data: %p', (overrides, expectedErrors) => {
      const result = TodoValidator.validateTodoData(createValidTodoData(overrides));
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(expect.arrayContaining(expectedErrors));
    });
  });
});
