import { Todo } from '../../src/domain/todo';
import { TodoData } from '../../src/domain/todoValidator';
import { FileSystem } from '../../src/infrastructure/fileSystem';
import { TodoRepository } from '../../src/infrastructure/todoRepository';
import { JsonTodoRepository } from '../../src/infrastructure/jsonTodoRepository';
import { IErrorHandler, ErrorResult } from '../../src/application/errorHandler';

// Test constants
const DEFAULT_FILE_PATH = 'data/todos.json';
const FILE_NOT_FOUND_ERROR = new Error('File not found');
const INVALID_JSON = 'invalid json';
const TODO_NOT_FOUND_ERROR = 'Todo not found';

// Test data factories
const createTestTodo = (overrides: Partial<TodoData> = {}): TodoData => ({
  id: '123',
  title: 'Test Todo',
  description: 'Test Description',
  status: 'pending',
  ...overrides,
});

const createMultipleTodos = (count: number = 2): TodoData[] =>
  [
    createTestTodo(),
    createTestTodo({
      id: '456',
      title: 'Second Todo',
      description: 'Second Description',
      status: 'completed',
    }),
  ].slice(0, count);

const createFileSystemMock = (): jest.Mocked<FileSystem> => ({
  readFile: jest.fn(),
  writeFile: jest.fn(),
  ensureDir: jest.fn(),
  remove: jest.fn(),
});

const createErrorHandlerMock = (): jest.Mocked<IErrorHandler> => ({
  handleError: jest.fn(),
  isRetryableError: jest.fn(),
  getErrorSeverity: jest.fn(),
  formatErrorForUser: jest.fn(),
});

// Test helpers
const setupFileWithTodos = (fileSystem: jest.Mocked<FileSystem>, todos: TodoData[]): void => {
  fileSystem.readFile.mockResolvedValue(JSON.stringify(todos));
};

const expectFileWriteCall = (fileSystem: jest.Mocked<FileSystem>, filePath: string, todos: TodoData[]): void => {
  expect(fileSystem.writeFile).toHaveBeenCalledWith(filePath, JSON.stringify(todos, null, 2));
};

const expectTodoNotFoundError = async (promise: Promise<any>): Promise<void> => {
  await expect(promise).rejects.toThrow(TODO_NOT_FOUND_ERROR);
};

describe('JsonTodoRepository', () => {
  let fileSystem: jest.Mocked<FileSystem>;
  let errorHandler: jest.Mocked<IErrorHandler>;
  let todoRepository: TodoRepository;
  let testTodoData: TodoData;

  beforeEach(() => {
    fileSystem = createFileSystemMock();
    errorHandler = createErrorHandlerMock();
    // Default to legacy constructor for backward compatibility tests
    todoRepository = new JsonTodoRepository(fileSystem);
    testTodoData = createTestTodo();
  });

  describe('save', () => {
    it('should save a new todo to empty storage', async () => {
      fileSystem.readFile.mockRejectedValue(FILE_NOT_FOUND_ERROR);
      fileSystem.writeFile.mockResolvedValue();

      const todo = new Todo(testTodoData);
      await todoRepository.save(todo);

      expectFileWriteCall(fileSystem, DEFAULT_FILE_PATH, [testTodoData]);
    });

    it('should save a new todo to existing storage', async () => {
      const existingTodo = createTestTodo({
        id: '456',
        title: 'Existing Todo',
        description: 'Existing Description',
        status: 'completed',
      });
      setupFileWithTodos(fileSystem, [existingTodo]);
      fileSystem.writeFile.mockResolvedValue();

      const todo = new Todo(testTodoData);
      await todoRepository.save(todo);

      expectFileWriteCall(fileSystem, DEFAULT_FILE_PATH, [existingTodo, testTodoData]);
    });
  });

  describe('findById', () => {
    it('should return todo when found', async () => {
      setupFileWithTodos(fileSystem, [testTodoData]);

      const result = await todoRepository.findById('123');

      expect(result).toBeInstanceOf(Todo);
      expect(result?.id).toBe('123');
      expect(result?.title).toBe('Test Todo');
    });

    it('should return null when todo not found', async () => {
      setupFileWithTodos(fileSystem, [testTodoData]);

      const result = await todoRepository.findById('nonexistent');

      expect(result).toBeNull();
    });

    it('should return null when file does not exist', async () => {
      fileSystem.readFile.mockRejectedValue(FILE_NOT_FOUND_ERROR);

      const result = await todoRepository.findById('123');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all todos when file exists', async () => {
      const existingTodos = createMultipleTodos();
      setupFileWithTodos(fileSystem, existingTodos);

      const result = await todoRepository.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Todo);
      expect(result[0].id).toBe('123');
      expect(result[1]).toBeInstanceOf(Todo);
      expect(result[1].id).toBe('456');
    });

    it('should return empty array when file does not exist', async () => {
      fileSystem.readFile.mockRejectedValue(FILE_NOT_FOUND_ERROR);

      const result = await todoRepository.findAll();

      expect(result).toEqual([]);
    });

    it('should return empty array when file is empty', async () => {
      fileSystem.readFile.mockResolvedValue('[]');

      const result = await todoRepository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update existing todo', async () => {
      const existingTodos = createMultipleTodos();
      setupFileWithTodos(fileSystem, existingTodos);
      fileSystem.writeFile.mockResolvedValue();

      const updatedTodo = new Todo(
        createTestTodo({
          title: 'Updated Title',
          description: 'Updated Description',
          status: 'completed',
        })
      );

      await todoRepository.update(updatedTodo);

      const expectedTodos = [
        createTestTodo({
          title: 'Updated Title',
          description: 'Updated Description',
          status: 'completed',
        }),
        createTestTodo({
          id: '456',
          title: 'Second Todo',
          description: 'Second Description',
          status: 'completed',
        }),
      ];

      expectFileWriteCall(fileSystem, DEFAULT_FILE_PATH, expectedTodos);
    });

    it('should throw error when todo does not exist', async () => {
      setupFileWithTodos(fileSystem, [testTodoData]);

      const nonExistentTodo = new Todo(
        createTestTodo({
          id: 'nonexistent',
          title: 'Non-existent Todo',
          description: 'Non-existent Description',
        })
      );

      await expectTodoNotFoundError(todoRepository.update(nonExistentTodo));
    });

    it('should throw error when file does not exist', async () => {
      fileSystem.readFile.mockRejectedValue(FILE_NOT_FOUND_ERROR);

      const todo = new Todo(testTodoData);

      await expectTodoNotFoundError(todoRepository.update(todo));
    });
  });

  describe('delete', () => {
    it('should delete existing todo', async () => {
      const existingTodos = createMultipleTodos();
      setupFileWithTodos(fileSystem, existingTodos);
      fileSystem.writeFile.mockResolvedValue();

      await todoRepository.delete('123');

      const expectedTodos = [
        createTestTodo({
          id: '456',
          title: 'Second Todo',
          description: 'Second Description',
          status: 'completed',
        }),
      ];

      expectFileWriteCall(fileSystem, DEFAULT_FILE_PATH, expectedTodos);
    });

    it('should throw error when todo does not exist', async () => {
      setupFileWithTodos(fileSystem, [testTodoData]);

      await expectTodoNotFoundError(todoRepository.delete('nonexistent'));
    });

    it('should throw error when file does not exist', async () => {
      fileSystem.readFile.mockRejectedValue(FILE_NOT_FOUND_ERROR);

      await expectTodoNotFoundError(todoRepository.delete('123'));
    });
  });

  describe('error scenarios', () => {
    describe('invalid JSON handling', () => {
      const setupInvalidJson = () => fileSystem.readFile.mockResolvedValue(INVALID_JSON);

      it('should throw error on findById when JSON is invalid', async () => {
        setupInvalidJson();
        await expect(todoRepository.findById('123')).rejects.toThrow();
      });

      it('should throw error on findAll when JSON is invalid', async () => {
        setupInvalidJson();
        await expect(todoRepository.findAll()).rejects.toThrow();
      });

      it('should throw error on update when JSON is invalid', async () => {
        setupInvalidJson();
        const todo = new Todo(testTodoData);
        await expect(todoRepository.update(todo)).rejects.toThrow();
      });

      it('should throw error on delete when JSON is invalid', async () => {
        setupInvalidJson();
        await expect(todoRepository.delete('123')).rejects.toThrow();
      });
    });

    describe('directory creation', () => {
      it('should ensure directory exists before saving', async () => {
        fileSystem.readFile.mockRejectedValue(FILE_NOT_FOUND_ERROR);
        fileSystem.ensureDir.mockResolvedValue();
        fileSystem.writeFile.mockResolvedValue();

        const todo = new Todo(testTodoData);
        await todoRepository.save(todo);

        expect(fileSystem.ensureDir).toHaveBeenCalledWith('data');
      });

      it('should use custom file path when provided', async () => {
        const customFilePath = 'custom/path/todos.json';
        const customRepository = new JsonTodoRepository(fileSystem, customFilePath);
        fileSystem.readFile.mockRejectedValue(FILE_NOT_FOUND_ERROR);
        fileSystem.ensureDir.mockResolvedValue();
        fileSystem.writeFile.mockResolvedValue();

        const todo = new Todo(testTodoData);
        await customRepository.save(todo);

        expect(fileSystem.ensureDir).toHaveBeenCalledWith('custom');
        expectFileWriteCall(fileSystem, customFilePath, [testTodoData]);
      });
    });

    describe('ErrorHandler integration', () => {
      beforeEach(() => {
        // Create repository with ErrorHandler for these tests
        todoRepository = new JsonTodoRepository(fileSystem, errorHandler);
      });

      it('should use ErrorHandler for file read errors during update', async () => {
        const fileError = new Error('ENOENT: file not found');
        (fileError as any).code = 'ENOENT';
        fileSystem.readFile.mockRejectedValue(fileError);

        const errorResult: ErrorResult = {
          code: 'IO_ERROR',
          message: 'File system operation failed',
          details: { type: 'file_not_found', path: DEFAULT_FILE_PATH },
        };
        errorHandler.handleError.mockReturnValue(errorResult);

        const todo = new Todo(testTodoData);

        await expect(todoRepository.update(todo)).rejects.toThrow('File system operation failed');
        expect(errorHandler.handleError).toHaveBeenCalledWith(fileError);
      });

      it('should use ErrorHandler for file read errors during delete', async () => {
        const fileError = new Error('EACCES: permission denied');
        (fileError as any).code = 'EACCES';
        fileSystem.readFile.mockRejectedValue(fileError);

        const errorResult: ErrorResult = {
          code: 'IO_ERROR',
          message: 'File system operation failed',
          details: { type: 'permission_denied', path: DEFAULT_FILE_PATH },
        };
        errorHandler.handleError.mockReturnValue(errorResult);

        await expect(todoRepository.delete('123')).rejects.toThrow('File system operation failed');
        expect(errorHandler.handleError).toHaveBeenCalledWith(fileError);
      });

      it('should not call ErrorHandler for todo not found errors', async () => {
        setupFileWithTodos(fileSystem, [testTodoData]);

        await expectTodoNotFoundError(todoRepository.update(new Todo(createTestTodo({ id: 'nonexistent' }))));
        expect(errorHandler.handleError).not.toHaveBeenCalled();
      });

      it('should preserve JSON parsing errors by re-throwing them directly', async () => {
        const jsonError = new SyntaxError('Unexpected token');
        fileSystem.readFile.mockResolvedValue(INVALID_JSON);

        await expect(todoRepository.findById('123')).rejects.toThrow(SyntaxError);
        expect(errorHandler.handleError).not.toHaveBeenCalled();
      });
    });

    describe('backward compatibility', () => {
      it('should work without ErrorHandler (legacy constructor)', async () => {
        const legacyRepository = new JsonTodoRepository(fileSystem);
        setupFileWithTodos(fileSystem, [testTodoData]);

        const result = await legacyRepository.findById('123');

        expect(result).toBeInstanceOf(Todo);
        expect(result?.id).toBe('123');
      });

      it('should work with old constructor signature (fileSystem, filePath)', async () => {
        const customFilePath = 'custom/todos.json';
        const legacyRepository = new JsonTodoRepository(fileSystem, customFilePath);
        setupFileWithTodos(fileSystem, [testTodoData]);

        const result = await legacyRepository.findById('123');

        expect(result).toBeInstanceOf(Todo);
        expect(result?.id).toBe('123');
      });

      it('should work with new constructor signature (fileSystem, errorHandler, filePath)', async () => {
        const customFilePath = 'custom/todos.json';
        const newRepository = new JsonTodoRepository(fileSystem, errorHandler, customFilePath);
        setupFileWithTodos(fileSystem, [testTodoData]);

        const result = await newRepository.findById('123');

        expect(result).toBeInstanceOf(Todo);
        expect(result?.id).toBe('123');
      });
    });
  });
});
