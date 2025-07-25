import { TodoValidator } from '../../src/domain/todoValidator';

describe('TodoValidator', () => {
  describe('validateTitle', () => {
    it('should return true for valid non-empty title', () => {
      expect(TodoValidator.validateTitle('Buy groceries')).toBe(true);
      expect(TodoValidator.validateTitle('Complete project')).toBe(true);
      expect(TodoValidator.validateTitle('a')).toBe(true);
    });

    it('should return false for empty title', () => {
      expect(TodoValidator.validateTitle('')).toBe(false);
    });

    it('should return false for whitespace-only title', () => {
      expect(TodoValidator.validateTitle('   ')).toBe(false);
      expect(TodoValidator.validateTitle('\t')).toBe(false);
      expect(TodoValidator.validateTitle('\n')).toBe(false);
    });

    it('should return false for null or undefined title', () => {
      expect(TodoValidator.validateTitle(null as any)).toBe(false);
      expect(TodoValidator.validateTitle(undefined as any)).toBe(false);
    });
  });

  describe('validateStatus', () => {
    it('should return true for valid status values', () => {
      expect(TodoValidator.validateStatus('pending')).toBe(true);
      expect(TodoValidator.validateStatus('completed')).toBe(true);
    });

    it('should return false for invalid status values', () => {
      expect(TodoValidator.validateStatus('invalid')).toBe(false);
      expect(TodoValidator.validateStatus('done')).toBe(false);
      expect(TodoValidator.validateStatus('todo')).toBe(false);
      expect(TodoValidator.validateStatus('')).toBe(false);
    });

    it('should return false for null or undefined status', () => {
      expect(TodoValidator.validateStatus(null as any)).toBe(false);
      expect(TodoValidator.validateStatus(undefined as any)).toBe(false);
    });
  });

  describe('validateTodoData', () => {
    it('should return validation result for complete todo data', () => {
      const validData = {
        id: '123',
        title: 'Test todo',
        description: 'Test description',
        status: 'pending' as const,
      };

      const result = TodoValidator.validateTodoData(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should return errors for invalid title', () => {
      const invalidData = {
        id: '123',
        title: '',
        description: 'Test description',
        status: 'pending' as const,
      };

      const result = TodoValidator.validateTodoData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Title cannot be empty');
    });

    it('should return errors for invalid status', () => {
      const invalidData = {
        id: '123',
        title: 'Test todo',
        description: 'Test description',
        status: 'invalid' as any,
      };

      const result = TodoValidator.validateTodoData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Status must be either "pending" or "completed"');
    });

    it('should return multiple errors for multiple invalid fields', () => {
      const invalidData = {
        id: '123',
        title: '',
        description: 'Test description',
        status: 'invalid' as any,
      };

      const result = TodoValidator.validateTodoData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Title cannot be empty');
      expect(result.errors).toContain('Status must be either "pending" or "completed"');
    });
  });
});
