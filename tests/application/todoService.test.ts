import { TodoService, ServiceResult, CreateTodoInput } from '../../src/application/TodoService';
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
  });

  describe('constructor', () => {
    it('should create TodoService with injected dependencies', () => {
      const todoService = new TodoService(mockTodoRepository, mockIdGenerator, mockErrorHandler);

      expect(todoService).toBeInstanceOf(TodoService);
    });
  });

  describe('createTodo', () => {
    let todoService: TodoService;

    beforeEach(() => {
      todoService = new TodoService(mockTodoRepository, mockIdGenerator, mockErrorHandler);
    });

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

      const errorResult: ErrorResult = {
        code: 'VALIDATION_ERROR',
        message: 'Invalid Todo data',
        details: { errors: ['Title cannot be empty'] },
      };
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
    let todoService: TodoService;

    beforeEach(() => {
      todoService = new TodoService(mockTodoRepository, mockIdGenerator, mockErrorHandler);
    });

    it('should return all todos successfully', async () => {
      const mockTodos = [
        new Todo({
          id: '1',
          title: 'Todo 1',
          description: 'Description 1',
          status: 'pending' as TodoStatus,
        }),
        new Todo({
          id: '2',
          title: 'Todo 2',
          description: 'Description 2',
          status: 'completed' as TodoStatus,
        }),
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

      const errorResult: ErrorResult = {
        code: 'SERVICE_ERROR',
        message: 'Database connection failed',
        details: { originalError: 'Database connection failed' },
      };
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
});
