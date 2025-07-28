import { TodoService } from '../../src/application/services/TodoService';
import { TodoRepository } from '../../src/interfaces/infrastructure/TodoRepository';
import { IdGenerator } from '../../src/interfaces/infrastructure/IdGenerator';
import { IErrorHandler } from '../../src/interfaces/application/IErrorHandler';
import { Todo } from '../../src/domain/todo';
import { ValidationError } from '../../src/domain/validationError';

describe('TodoService', () => {
  let todoService: TodoService;
  let mockRepository: jest.Mocked<TodoRepository>;
  let mockIdGenerator: jest.Mocked<IdGenerator>;
  let mockErrorHandler: jest.Mocked<IErrorHandler>;

  beforeEach(() => {
    mockRepository = {
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

    todoService = new TodoService(mockRepository, mockIdGenerator, mockErrorHandler);
  });

  describe('createTodo', () => {
    it('should create a new todo successfully', async () => {
      // Arrange
      const request = { title: 'Test Todo', description: 'Test Description' };
      const generatedId = 'generated-id';
      mockIdGenerator.generate.mockReturnValue(generatedId);
      mockRepository.save.mockResolvedValue(undefined);

      // Act
      const result = await todoService.createTodo(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Todo);
      expect(result.data?.title).toBe('Test Todo');
      expect(result.data?.description).toBe('Test Description');
      expect(result.data?.status).toBe('pending');
      expect(mockRepository.save).toHaveBeenCalledWith(expect.any(Todo));
    });

    it('should return error when todo creation fails', async () => {
      // Arrange
      const request = { title: 'Test Todo', description: 'Test Description' };
      const generatedId = 'generated-id';
      const error = new Error('Repository error');
      mockIdGenerator.generate.mockReturnValue(generatedId);
      mockRepository.save.mockRejectedValue(error);
      mockErrorHandler.handleError.mockReturnValue({
        code: 'REPOSITORY_ERROR',
        message: 'Failed to save todo',
        details: {},
      });

      // Act
      const result = await todoService.createTodo(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to save todo');
      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(error);
    });

    it('should return error when invalid todo data is provided', async () => {
      // Arrange
      const request = { title: '', description: 'Test Description' };
      const generatedId = 'generated-id';
      mockIdGenerator.generate.mockReturnValue(generatedId);
      mockErrorHandler.handleError.mockReturnValue({
        code: 'VALIDATION_ERROR',
        message: 'Invalid todo data',
        details: {},
      });

      // Act
      const result = await todoService.createTodo(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid todo data');
      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(expect.any(ValidationError));
    });
  });

  describe('getAllTodos', () => {
    it('should return all todos successfully', async () => {
      // Arrange
      const mockTodos = [
        new Todo({ id: '1', title: 'Todo 1', description: 'Desc 1', status: 'pending' }),
        new Todo({ id: '2', title: 'Todo 2', description: 'Desc 2', status: 'completed' }),
      ];
      mockRepository.findAll.mockResolvedValue(mockTodos);

      // Act
      const result = await todoService.getAllTodos();

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTodos);
      expect(result.data).toHaveLength(2);
    });

    it('should return error when repository fails', async () => {
      // Arrange
      const error = new Error('Repository error');
      mockRepository.findAll.mockRejectedValue(error);
      mockErrorHandler.handleError.mockReturnValue({
        code: 'REPOSITORY_ERROR',
        message: 'Failed to retrieve todos',
        details: {},
      });

      // Act
      const result = await todoService.getAllTodos();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to retrieve todos');
      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(error);
    });
  });

  describe('getTodoById', () => {
    it('should return todo when found', async () => {
      // Arrange
      const todoId = 'test-id';
      const mockTodo = new Todo({ id: todoId, title: 'Test Todo', description: 'Test Desc', status: 'pending' });
      mockRepository.findById.mockResolvedValue(mockTodo);

      // Act
      const result = await todoService.getTodoById(todoId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTodo);
    });

    it('should return error when todo not found', async () => {
      // Arrange
      const todoId = 'non-existent-id';
      mockRepository.findById.mockResolvedValue(null);

      // Act
      const result = await todoService.getTodoById(todoId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Todo not found');
    });

    it('should return error when repository fails', async () => {
      // Arrange
      const todoId = 'test-id';
      const error = new Error('Repository error');
      mockRepository.findById.mockRejectedValue(error);
      mockErrorHandler.handleError.mockReturnValue({
        code: 'REPOSITORY_ERROR',
        message: 'Failed to retrieve todo',
        details: {},
      });

      // Act
      const result = await todoService.getTodoById(todoId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to retrieve todo');
      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(error);
    });
  });

  describe('updateTodo', () => {
    it('should update todo successfully', async () => {
      // Arrange
      const todoId = 'test-id';
      const existingTodo = new Todo({ id: todoId, title: 'Old Title', description: 'Old Desc', status: 'pending' });
      const updateRequest = { id: todoId, title: 'New Title', description: 'New Desc' };

      mockRepository.findById.mockResolvedValue(existingTodo);
      mockRepository.update.mockResolvedValue(undefined);

      // Act
      const result = await todoService.updateTodo(updateRequest);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Todo);
      expect(result.data?.title).toBe('New Title');
      expect(result.data?.description).toBe('New Desc');
      expect(mockRepository.update).toHaveBeenCalledWith(expect.any(Todo));
    });

    it('should return error when todo not found', async () => {
      // Arrange
      const updateRequest = { id: 'non-existent-id', title: 'New Title' };
      mockRepository.findById.mockResolvedValue(null);

      // Act
      const result = await todoService.updateTodo(updateRequest);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Todo not found');
    });

    it('should return error when repository fails', async () => {
      // Arrange
      const todoId = 'test-id';
      const existingTodo = new Todo({ id: todoId, title: 'Old Title', description: 'Old Desc', status: 'pending' });
      const updateRequest = { id: todoId, title: 'New Title' };
      const error = new Error('Repository error');

      mockRepository.findById.mockResolvedValue(existingTodo);
      mockRepository.update.mockRejectedValue(error);
      mockErrorHandler.handleError.mockReturnValue({
        code: 'REPOSITORY_ERROR',
        message: 'Failed to update todo',
        details: {},
      });

      // Act
      const result = await todoService.updateTodo(updateRequest);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to update todo');
      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteTodo', () => {
    it('should delete todo successfully', async () => {
      // Arrange
      const todoId = 'test-id';
      const existingTodo = new Todo({ id: todoId, title: 'Test Todo', description: 'Test Desc', status: 'pending' });
      mockRepository.findById.mockResolvedValue(existingTodo);
      mockRepository.delete.mockResolvedValue(undefined);

      // Act
      const result = await todoService.deleteTodo(todoId);

      // Assert
      expect(result.success).toBe(true);
      expect(mockRepository.delete).toHaveBeenCalledWith(todoId);
    });

    it('should return error when todo not found', async () => {
      // Arrange
      const todoId = 'non-existent-id';
      mockRepository.findById.mockResolvedValue(null);

      // Act
      const result = await todoService.deleteTodo(todoId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Todo not found');
    });

    it('should return error when repository fails', async () => {
      // Arrange
      const todoId = 'test-id';
      const existingTodo = new Todo({ id: todoId, title: 'Test Todo', description: 'Test Desc', status: 'pending' });
      const error = new Error('Repository error');

      mockRepository.findById.mockResolvedValue(existingTodo);
      mockRepository.delete.mockRejectedValue(error);
      mockErrorHandler.handleError.mockReturnValue({
        code: 'REPOSITORY_ERROR',
        message: 'Failed to delete todo',
        details: {},
      });

      // Act
      const result = await todoService.deleteTodo(todoId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to delete todo');
      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(error);
    });
  });

  describe('markTodoCompleted', () => {
    it('should mark todo as completed successfully', async () => {
      // Arrange
      const todoId = 'test-id';
      const existingTodo = new Todo({ id: todoId, title: 'Test Todo', description: 'Test Desc', status: 'pending' });
      mockRepository.findById.mockResolvedValue(existingTodo);
      mockRepository.update.mockResolvedValue(undefined);

      // Act
      const result = await todoService.markTodoCompleted(todoId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('completed');
      expect(mockRepository.update).toHaveBeenCalledWith(expect.any(Todo));
    });

    it('should return error when todo not found', async () => {
      // Arrange
      const todoId = 'non-existent-id';
      mockRepository.findById.mockResolvedValue(null);

      // Act
      const result = await todoService.markTodoCompleted(todoId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Todo not found');
    });
  });

  describe('markTodoPending', () => {
    it('should mark todo as pending successfully', async () => {
      // Arrange
      const todoId = 'test-id';
      const existingTodo = new Todo({ id: todoId, title: 'Test Todo', description: 'Test Desc', status: 'completed' });
      mockRepository.findById.mockResolvedValue(existingTodo);
      mockRepository.update.mockResolvedValue(undefined);

      // Act
      const result = await todoService.markTodoPending(todoId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('pending');
      expect(mockRepository.update).toHaveBeenCalledWith(expect.any(Todo));
    });

    it('should return error when todo not found', async () => {
      // Arrange
      const todoId = 'non-existent-id';
      mockRepository.findById.mockResolvedValue(null);

      // Act
      const result = await todoService.markTodoPending(todoId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Todo not found');
    });
  });
});
