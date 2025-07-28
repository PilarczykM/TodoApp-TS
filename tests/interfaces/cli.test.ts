import { TodoCLI } from '../../src/interfaces/cli/TodoCLI';
import { ITodoService } from '../../src/interfaces/application/ITodoService';
import { ConsoleInterface } from '../../src/interfaces/application/ConsoleInterface';
import { CommandDispatcher } from '../../src/interfaces/application/CommandDispatcher';
import { Todo } from '../../src/domain/todo';

describe('TodoCLI', () => {
  let cli: TodoCLI;
  let mockTodoService: jest.Mocked<ITodoService>;
  let mockConsole: jest.Mocked<ConsoleInterface>;
  let mockDispatcher: jest.Mocked<CommandDispatcher>;

  beforeEach(() => {
    mockTodoService = {
      createTodo: jest.fn(),
      getAllTodos: jest.fn(),
      getTodoById: jest.fn(),
      updateTodo: jest.fn(),
      deleteTodo: jest.fn(),
      markTodoCompleted: jest.fn(),
      markTodoPending: jest.fn(),
    };

    mockConsole = {
      displayMessage: jest.fn(),
      displayError: jest.fn(),
      displaySuccess: jest.fn(),
      displayWarning: jest.fn(),
      displayInfo: jest.fn(),
      displayTable: jest.fn(),
      promptText: jest.fn(),
      promptSelect: jest.fn(),
      promptConfirm: jest.fn(),
      clear: jest.fn(),
    };

    mockDispatcher = {
      registerCommand: jest.fn(),
      dispatch: jest.fn(),
      getAvailableCommands: jest.fn(),
    };

    cli = new TodoCLI(mockTodoService, mockConsole, mockDispatcher);
  });

  describe('constructor', () => {
    it('should register all commands on initialization', () => {
      // Assert
      expect(mockDispatcher.registerCommand).toHaveBeenCalledWith('create', expect.any(Function));
      expect(mockDispatcher.registerCommand).toHaveBeenCalledWith('list', expect.any(Function));
      expect(mockDispatcher.registerCommand).toHaveBeenCalledWith('show', expect.any(Function));
      expect(mockDispatcher.registerCommand).toHaveBeenCalledWith('update', expect.any(Function));
      expect(mockDispatcher.registerCommand).toHaveBeenCalledWith('delete', expect.any(Function));
      expect(mockDispatcher.registerCommand).toHaveBeenCalledWith('complete', expect.any(Function));
      expect(mockDispatcher.registerCommand).toHaveBeenCalledWith('pending', expect.any(Function));
      expect(mockDispatcher.registerCommand).toHaveBeenCalledWith('help', expect.any(Function));
      expect(mockDispatcher.registerCommand).toHaveBeenCalledWith('exit', expect.any(Function));
    });
  });

  describe('initialization', () => {
    it('should initialize without errors', () => {
      // The constructor already ran, so just verify we have a CLI instance
      expect(cli).toBeDefined();
    });
  });

  describe('command handlers', () => {
    describe('create command', () => {
      it('should create a new todo successfully', async () => {
        // Arrange
        const mockTodo = new Todo({ id: '1', title: 'Test Todo', description: 'Test Description', status: 'pending' });
        mockConsole.promptText.mockResolvedValueOnce('Test Todo').mockResolvedValueOnce('Test Description');
        mockTodoService.createTodo.mockResolvedValue({
          success: true,
          data: mockTodo,
        });

        // Get the create handler from the registered commands
        const createHandler = mockDispatcher.registerCommand.mock.calls.find(call => call[0] === 'create')?.[1];

        // Act
        const result = await createHandler?.([]);

        // Assert
        expect(mockConsole.promptText).toHaveBeenCalledWith('Enter todo title:');
        expect(mockConsole.promptText).toHaveBeenCalledWith('Enter todo description:');
        expect(mockTodoService.createTodo).toHaveBeenCalledWith({
          title: 'Test Todo',
          description: 'Test Description',
        });
        expect(result?.success).toBe(true);
        expect(result?.message).toBe('Todo created successfully!');
      });

      it('should handle create todo failure', async () => {
        // Arrange
        mockConsole.promptText.mockResolvedValueOnce('Test Todo').mockResolvedValueOnce('Test Description');
        mockTodoService.createTodo.mockResolvedValue({
          success: false,
          error: 'Creation failed',
        });

        const createHandler = mockDispatcher.registerCommand.mock.calls.find(call => call[0] === 'create')?.[1];

        // Act
        const result = await createHandler?.([]);

        // Assert
        expect(result?.success).toBe(false);
        expect(result?.message).toBe('Creation failed');
      });
    });

    describe('list command', () => {
      it('should display all todos', async () => {
        // Arrange
        const mockTodos = [
          new Todo({ id: '1', title: 'Todo 1', description: 'Desc 1', status: 'pending' }),
          new Todo({ id: '2', title: 'Todo 2', description: 'Desc 2', status: 'completed' }),
        ];
        mockTodoService.getAllTodos.mockResolvedValue({
          success: true,
          data: mockTodos,
        });

        const listHandler = mockDispatcher.registerCommand.mock.calls.find(call => call[0] === 'list')?.[1];

        // Act
        const result = await listHandler?.([]);

        // Assert
        expect(mockTodoService.getAllTodos).toHaveBeenCalled();
        expect(mockConsole.displayTable).toHaveBeenCalledWith([
          { id: '1', title: 'Todo 1', description: 'Desc 1', status: 'pending' },
          { id: '2', title: 'Todo 2', description: 'Desc 2', status: 'completed' },
        ]);
        expect(result?.success).toBe(true);
        expect(result?.message).toBe('Found 2 todos');
      });

      it('should handle empty todo list', async () => {
        // Arrange
        mockTodoService.getAllTodos.mockResolvedValue({
          success: true,
          data: [],
        });

        const listHandler = mockDispatcher.registerCommand.mock.calls.find(call => call[0] === 'list')?.[1];

        // Act
        const result = await listHandler?.([]);

        // Assert
        expect(mockConsole.displayInfo).toHaveBeenCalledWith('No todos found');
        expect(result?.success).toBe(true);
        expect(result?.message).toBe('Found 0 todos');
      });
    });

    describe('help command', () => {
      it('should display help information', async () => {
        // Arrange
        mockDispatcher.getAvailableCommands.mockReturnValue(['create', 'list', 'help', 'exit']);

        const helpHandler = mockDispatcher.registerCommand.mock.calls.find(call => call[0] === 'help')?.[1];

        // Act
        const result = await helpHandler?.([]);

        // Assert
        expect(mockConsole.displayInfo).toHaveBeenCalledWith('Available commands:');
        expect(mockDispatcher.getAvailableCommands).toHaveBeenCalled();
        expect(result?.success).toBe(true);
        expect(result?.message).toBe('Help displayed');
      });
    });

    describe('exit command', () => {
      it('should return exit result', async () => {
        // Arrange
        const exitHandler = mockDispatcher.registerCommand.mock.calls.find(call => call[0] === 'exit')?.[1];

        // Act
        const result = await exitHandler?.([]);

        // Assert
        expect(mockConsole.displaySuccess).toHaveBeenCalledWith('Thank you for using Todo App! Goodbye!');
        expect(result?.success).toBe(true);
        expect(result?.message).toBe('exit');
      });
    });
  });
});
