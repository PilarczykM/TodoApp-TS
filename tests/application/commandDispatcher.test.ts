import { CommandDispatcher } from '../../src/application/services/CommandDispatcher';
import { CommandHandler, CommandResult } from '../../src/interfaces/application/CommandDispatcher';

describe('CommandDispatcher', () => {
  let dispatcher: CommandDispatcher;

  beforeEach(() => {
    dispatcher = new CommandDispatcher();
  });

  describe('registerCommand', () => {
    it('should register a command handler', () => {
      // Arrange
      const mockHandler: CommandHandler = jest.fn().mockResolvedValue({ success: true });

      // Act
      dispatcher.registerCommand('test', mockHandler);

      // Assert
      const availableCommands = dispatcher.getAvailableCommands();
      expect(availableCommands).toContain('test');
    });

    it('should allow registering multiple commands', () => {
      // Arrange
      const handler1: CommandHandler = jest.fn().mockResolvedValue({ success: true });
      const handler2: CommandHandler = jest.fn().mockResolvedValue({ success: true });

      // Act
      dispatcher.registerCommand('command1', handler1);
      dispatcher.registerCommand('command2', handler2);

      // Assert
      const availableCommands = dispatcher.getAvailableCommands();
      expect(availableCommands).toContain('command1');
      expect(availableCommands).toContain('command2');
      expect(availableCommands).toHaveLength(2);
    });

    it('should overwrite existing command with same name', () => {
      // Arrange
      const handler1: CommandHandler = jest.fn().mockResolvedValue({ success: true });
      const handler2: CommandHandler = jest.fn().mockResolvedValue({ success: false });

      // Act
      dispatcher.registerCommand('test', handler1);
      dispatcher.registerCommand('test', handler2);

      // Assert
      const availableCommands = dispatcher.getAvailableCommands();
      expect(availableCommands).toContain('test');
      expect(availableCommands).toHaveLength(1);
    });
  });

  describe('dispatch', () => {
    it('should execute registered command handler', async () => {
      // Arrange
      const expectedResult: CommandResult = { success: true, message: 'Command executed' };
      const mockHandler: CommandHandler = jest.fn().mockResolvedValue(expectedResult);
      dispatcher.registerCommand('test', mockHandler);

      // Act
      const result = await dispatcher.dispatch('test', ['arg1', 'arg2']);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(mockHandler).toHaveBeenCalledWith(['arg1', 'arg2']);
    });

    it('should return error for unknown command', async () => {
      // Act
      const result = await dispatcher.dispatch('unknown', []);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Unknown command: unknown');
    });

    it('should handle command handler errors', async () => {
      // Arrange
      const error = new Error('Handler failed');
      const mockHandler: CommandHandler = jest.fn().mockRejectedValue(error);
      dispatcher.registerCommand('failing', mockHandler);

      // Act
      const result = await dispatcher.dispatch('failing', []);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Command failed: Handler failed');
    });

    it('should execute handler with empty args array when no args provided', async () => {
      // Arrange
      const mockHandler: CommandHandler = jest.fn().mockResolvedValue({ success: true });
      dispatcher.registerCommand('test', mockHandler);

      // Act
      await dispatcher.dispatch('test', []);

      // Assert
      expect(mockHandler).toHaveBeenCalledWith([]);
    });

    it('should preserve command handler result data', async () => {
      // Arrange
      const expectedData = { id: '123', title: 'Test Todo' };
      const expectedResult: CommandResult = {
        success: true,
        message: 'Todo created',
        data: expectedData,
      };
      const mockHandler: CommandHandler = jest.fn().mockResolvedValue(expectedResult);
      dispatcher.registerCommand('create', mockHandler);

      // Act
      const result = await dispatcher.dispatch('create', ['title', 'description']);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(result.data).toEqual(expectedData);
    });
  });

  describe('getAvailableCommands', () => {
    it('should return empty array when no commands are registered', () => {
      // Act
      const commands = dispatcher.getAvailableCommands();

      // Assert
      expect(commands).toEqual([]);
    });

    it('should return all registered command names', () => {
      // Arrange
      const handler1: CommandHandler = jest.fn().mockResolvedValue({ success: true });
      const handler2: CommandHandler = jest.fn().mockResolvedValue({ success: true });
      const handler3: CommandHandler = jest.fn().mockResolvedValue({ success: true });

      dispatcher.registerCommand('create', handler1);
      dispatcher.registerCommand('list', handler2);
      dispatcher.registerCommand('delete', handler3);

      // Act
      const commands = dispatcher.getAvailableCommands();

      // Assert
      expect(commands).toHaveLength(3);
      expect(commands).toContain('create');
      expect(commands).toContain('list');
      expect(commands).toContain('delete');
    });

    it('should return commands in alphabetical order', () => {
      // Arrange
      const handler: CommandHandler = jest.fn().mockResolvedValue({ success: true });
      dispatcher.registerCommand('zebra', handler);
      dispatcher.registerCommand('alpha', handler);
      dispatcher.registerCommand('beta', handler);

      // Act
      const commands = dispatcher.getAvailableCommands();

      // Assert
      expect(commands).toEqual(['alpha', 'beta', 'zebra']);
    });
  });
});
