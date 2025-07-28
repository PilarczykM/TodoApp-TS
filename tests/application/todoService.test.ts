import { TodoService, ServiceResult, CreateTodoInput, UpdateTodoInput } from '../../src/application/TodoService';
import { TodoRepository } from '../../src/interfaces/infrastructure/TodoRepository';
import { IdGenerator } from '../../src/interfaces/infrastructure/IdGenerator';
import { TodoValidator } from '../../src/domain/todoValidator';
import { IErrorHandler, ErrorResult } from '../../src/interfaces/application/IErrorHandler';
import { Todo } from '../../src/domain/todo';
import { TodoStatus } from '../../src/domain/types';
import { ValidationError } from '../../src/domain/validationError';

describe('TodoService', () => {
  let mockTodoRepository: jest.Mocked<TodoRepository>;
  let mockIdGenerator: jest.Mocked<IdGenerator>;
  let mockErrorHandler: jest.Mocked<IErrorHandler>;
  let todoService: TodoService;

  const createMockTodo = (
    overrides: Partial<{ id: string; title: string; description: string; status: TodoStatus }> = {}
  ): Todo => {
    return new Todo({
      id: '1',
      title: 'Test Todo',
      description: 'Test Description',
      status: 'pending' as TodoStatus,
      ...overrides,
    });
  };

  const createErrorResult = (message: string, code: string = 'VALIDATION_ERROR'): ErrorResult => ({
    code,
    message,
    details: { errors: [message] },
  });

  beforeEach(() => {
    mockTodoRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockIdGenerator = {
      generate: jest.fn(),
    };

    mockErrorHandler = {
      handleError: jest.fn(),
    };

    todoService = new TodoService(mockTodoRepository, mockIdGenerator, mockErrorHandler);
  });

  describe('constructor', () => {
    it('should create TodoService with injected dependencies', () => {
      expect(todoService).toBeInstanceOf(TodoService);
    });
  });

  describe('createTodo', () => {
    it('should create a new todo successfully', async () => {
      const input: CreateTodoInput = {
        title: 'Test Todo',
        description: 'Test Description',
        status: 'pending' as TodoStatus,
      };

      const generatedId = 'generated-id';
      mockIdGenerator.generate.mockReturnValue(generatedId);
      mockTodoRepository.save.mockResolvedValue();

      const result = await todoService.createTodo(input);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe(generatedId);
      expect(result.data?.title).toBe(input.title);
      expect(result.data?.description).toBe(input.description);
      expect(result.data?.status).toBe(input.status);
      expect(result.error).toBeUndefined();
    });

    it('should handle validation errors and return error result', async () => {
      const input: CreateTodoInput = {
        title: '',
        description: 'Test Description',
        status: 'pending' as TodoStatus,
      };

      const generatedId = 'generated-id';
      mockIdGenerator.generate.mockReturnValue(generatedId);

      const errorResult = createErrorResult('Invalid Todo data');
      mockErrorHandler.handleError.mockReturnValue(errorResult);

      const result = await todoService.createTodo(input);

      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.error).toBe('Invalid Todo data');
      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(expect.any(ValidationError));
      expect(mockTodoRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('listTodos', () => {
    it('should return all todos successfully', async () => {
      const mockTodos = [
        createMockTodo({ id: '1', title: 'Todo 1', description: 'Description 1' }),
        createMockTodo({ id: '2', title: 'Todo 2', description: 'Description 2', status: 'completed' as TodoStatus }),
      ];

      mockTodoRepository.findAll.mockResolvedValue(mockTodos);

      const result = await todoService.listTodos();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTodos);
      expect(result.data).toHaveLength(2);
      expect(result.error).toBeUndefined();
      expect(mockTodoRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should handle repository errors', async () => {
      const repositoryError = new Error('Database connection failed');
      mockTodoRepository.findAll.mockRejectedValue(repositoryError);

      const errorResult = createErrorResult('Database connection failed', 'SERVICE_ERROR');
      mockErrorHandler.handleError.mockReturnValue(errorResult);

      const result = await todoService.listTodos();

      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.error).toBe('Database connection failed');
      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(repositoryError);
    });

    it('should return empty array when no todos exist', async () => {
      mockTodoRepository.findAll.mockResolvedValue([]);

      const result = await todoService.listTodos();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
      expect(result.data).toHaveLength(0);
      expect(result.error).toBeUndefined();
    });
  });

  describe('updateTodo', () => {
    it('should update an existing todo successfully', async () => {
      const existingTodo = createMockTodo({
        title: 'Original Title',
        description: 'Original Description',
      });

      const updateInput: UpdateTodoInput = {
        title: 'Updated Title',
        description: 'Updated Description',
        status: 'completed' as TodoStatus,
      };

      mockTodoRepository.findById.mockResolvedValue(existingTodo);
      mockTodoRepository.update.mockResolvedValue();

      const result = await todoService.updateTodo('1', updateInput);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe('1');
      expect(result.data?.title).toBe('Updated Title');
      expect(result.data?.description).toBe('Updated Description');
      expect(result.data?.status).toBe('completed');
      expect(result.error).toBeUndefined();
      expect(mockTodoRepository.findById).toHaveBeenCalledWith('1');
      expect(mockTodoRepository.update).toHaveBeenCalledWith(expect.any(Todo));
    });

    it('should return error when todo is not found', async () => {
      const updateInput: UpdateTodoInput = {
        title: 'Updated Title',
      };

      mockTodoRepository.findById.mockResolvedValue(null);

      const result = await todoService.updateTodo('nonexistent-id', updateInput);

      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.error).toBe('Todo not found');
      expect(mockTodoRepository.findById).toHaveBeenCalledWith('nonexistent-id');
      expect(mockTodoRepository.update).not.toHaveBeenCalled();
    });

    it('should handle validation errors when updating todo', async () => {
      const existingTodo = createMockTodo({
        title: 'Original Title',
        description: 'Original Description',
      });

      const updateInput: UpdateTodoInput = {
        title: '', // Invalid empty title
      };

      mockTodoRepository.findById.mockResolvedValue(existingTodo);

      const errorResult = createErrorResult('Invalid Todo data');
      mockErrorHandler.handleError.mockReturnValue(errorResult);

      const result = await todoService.updateTodo('1', updateInput);

      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.error).toBe('Invalid Todo data');
      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(expect.any(ValidationError));
      expect(mockTodoRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteTodo', () => {
    it('should delete an existing todo successfully', async () => {
      const existingTodo = createMockTodo({
        title: 'Todo to delete',
        description: 'Description',
      });

      mockTodoRepository.findById.mockResolvedValue(existingTodo);
      mockTodoRepository.delete.mockResolvedValue();

      const result = await todoService.deleteTodo('1');

      expect(result.success).toBe(true);
      expect(result.data).toBeUndefined();
      expect(result.error).toBeUndefined();
      expect(mockTodoRepository.findById).toHaveBeenCalledWith('1');
      expect(mockTodoRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should return error when todo to delete is not found', async () => {
      mockTodoRepository.findById.mockResolvedValue(null);

      const result = await todoService.deleteTodo('nonexistent-id');

      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.error).toBe('Todo not found');
      expect(mockTodoRepository.findById).toHaveBeenCalledWith('nonexistent-id');
      expect(mockTodoRepository.delete).not.toHaveBeenCalled();
    });

    it('should handle repository errors during deletion', async () => {
      const existingTodo = createMockTodo({
        title: 'Todo to delete',
        description: 'Description',
      });

      const repositoryError = new Error('Database deletion failed');
      mockTodoRepository.findById.mockResolvedValue(existingTodo);
      mockTodoRepository.delete.mockRejectedValue(repositoryError);

      const errorResult = createErrorResult('Database deletion failed', 'SERVICE_ERROR');
      mockErrorHandler.handleError.mockReturnValue(errorResult);

      const result = await todoService.deleteTodo('1');

      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.error).toBe('Database deletion failed');
      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(repositoryError);
    });
  });
});
