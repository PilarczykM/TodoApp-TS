import { InquirerConsole } from '../../src/infrastructure/console/InquirerConsole';
import inquirer from 'inquirer';
import chalk from 'chalk';

// Mock dependencies
jest.mock('inquirer');
jest.mock('chalk', () => ({
  green: jest.fn().mockImplementation(str => `green(${str})`),
  red: jest.fn().mockImplementation(str => `red(${str})`),
  yellow: jest.fn().mockImplementation(str => `yellow(${str})`),
  blue: jest.fn().mockImplementation(str => `blue(${str})`),
  cyan: jest.fn().mockImplementation(str => `cyan(${str})`),
  magenta: jest.fn().mockImplementation(str => `magenta(${str})`),
}));

describe('InquirerConsole', () => {
  let consoleInterface: InquirerConsole;
  let mockConsoleLog: jest.SpyInstance;
  let mockConsoleError: jest.SpyInstance;
  let mockConsoleTable: jest.SpyInstance;
  let mockConsoleClear: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleInterface = new InquirerConsole();
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
    mockConsoleTable = jest.spyOn(console, 'table').mockImplementation();
    mockConsoleClear = jest.spyOn(console, 'clear').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('displayMessage', () => {
    it('should display plain message without color', () => {
      // Act
      consoleInterface.displayMessage('Hello World');

      // Assert
      expect(mockConsoleLog).toHaveBeenCalledWith('Hello World');
    });

    it('should display colored message when color is specified', () => {
      // Act
      consoleInterface.displayMessage('Success message', 'green');

      // Assert
      expect(chalk.green).toHaveBeenCalledWith('Success message');
      expect(mockConsoleLog).toHaveBeenCalledTimes(1);
    });

    it('should handle all supported colors', () => {
      // Arrange
      const colors: Array<'green' | 'red' | 'yellow' | 'blue' | 'cyan' | 'magenta'> = [
        'green',
        'red',
        'yellow',
        'blue',
        'cyan',
        'magenta',
      ];

      // Act & Assert
      colors.forEach(color => {
        consoleInterface.displayMessage(`${color} message`, color);
        expect(chalk[color]).toHaveBeenCalledWith(`${color} message`);
      });
    });
  });

  describe('displayError', () => {
    it('should display red error message', () => {
      // Act
      consoleInterface.displayError('Error occurred');

      // Assert
      expect(chalk.red).toHaveBeenCalledWith('❌ Error occurred');
      expect(mockConsoleError).toHaveBeenCalledTimes(1);
    });
  });

  describe('displaySuccess', () => {
    it('should display green success message', () => {
      // Act
      consoleInterface.displaySuccess('Operation successful');

      // Assert
      expect(chalk.green).toHaveBeenCalledWith('✅ Operation successful');
      expect(mockConsoleLog).toHaveBeenCalledTimes(1);
    });
  });

  describe('displayWarning', () => {
    it('should display yellow warning message', () => {
      // Act
      consoleInterface.displayWarning('Warning message');

      // Assert
      expect(chalk.yellow).toHaveBeenCalledWith('⚠️  Warning message');
      expect(mockConsoleLog).toHaveBeenCalledTimes(1);
    });
  });

  describe('displayInfo', () => {
    it('should display blue info message', () => {
      // Act
      consoleInterface.displayInfo('Information message');

      // Assert
      expect(chalk.blue).toHaveBeenCalledWith('ℹ️  Information message');
      expect(mockConsoleLog).toHaveBeenCalledTimes(1);
    });
  });

  describe('displayTable', () => {
    it('should display data as table', () => {
      // Arrange
      const data = [
        { id: '1', title: 'Todo 1', status: 'pending' },
        { id: '2', title: 'Todo 2', status: 'completed' },
      ];

      // Act
      consoleInterface.displayTable(data);

      // Assert
      expect(mockConsoleTable).toHaveBeenCalledWith(data);
    });

    it('should handle empty data array', () => {
      // Act
      consoleInterface.displayTable([]);

      // Assert
      expect(mockConsoleTable).toHaveBeenCalledWith([]);
    });
  });

  describe('promptText', () => {
    it('should prompt for text input', async () => {
      // Arrange
      const mockPrompt = jest.mocked(inquirer.prompt);
      mockPrompt.mockResolvedValue({ answer: 'User input' });

      // Act
      const result = await consoleInterface.promptText('Enter text:');

      // Assert
      expect(mockPrompt).toHaveBeenCalledWith([
        {
          type: 'input',
          name: 'answer',
          message: 'Enter text:',
        },
      ]);
      expect(result).toBe('User input');
    });

    it('should prompt for text input with default value', async () => {
      // Arrange
      const mockPrompt = jest.mocked(inquirer.prompt);
      mockPrompt.mockResolvedValue({ answer: 'Default value' });

      // Act
      const result = await consoleInterface.promptText('Enter text:', 'Default value');

      // Assert
      expect(mockPrompt).toHaveBeenCalledWith([
        {
          type: 'input',
          name: 'answer',
          message: 'Enter text:',
          default: 'Default value',
        },
      ]);
      expect(result).toBe('Default value');
    });
  });

  describe('promptSelect', () => {
    it('should prompt for selection from choices', async () => {
      // Arrange
      const choices = [
        { name: 'Option 1', value: 'opt1' },
        { name: 'Option 2', value: 'opt2' },
      ];
      const mockPrompt = jest.mocked(inquirer.prompt);
      mockPrompt.mockResolvedValue({ answer: 'opt1' });

      // Act
      const result = await consoleInterface.promptSelect('Choose option:', choices);

      // Assert
      expect(mockPrompt).toHaveBeenCalledWith([
        {
          type: 'list',
          name: 'answer',
          message: 'Choose option:',
          choices: choices,
        },
      ]);
      expect(result).toBe('opt1');
    });
  });

  describe('promptConfirm', () => {
    it('should prompt for confirmation', async () => {
      // Arrange
      const mockPrompt = jest.mocked(inquirer.prompt);
      mockPrompt.mockResolvedValue({ answer: true });

      // Act
      const result = await consoleInterface.promptConfirm('Are you sure?');

      // Assert
      expect(mockPrompt).toHaveBeenCalledWith([
        {
          type: 'confirm',
          name: 'answer',
          message: 'Are you sure?',
        },
      ]);
      expect(result).toBe(true);
    });

    it('should prompt for confirmation with default value', async () => {
      // Arrange
      const mockPrompt = jest.mocked(inquirer.prompt);
      mockPrompt.mockResolvedValue({ answer: false });

      // Act
      const result = await consoleInterface.promptConfirm('Are you sure?', false);

      // Assert
      expect(mockPrompt).toHaveBeenCalledWith([
        {
          type: 'confirm',
          name: 'answer',
          message: 'Are you sure?',
          default: false,
        },
      ]);
      expect(result).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear the console', () => {
      // Act
      consoleInterface.clear();

      // Assert
      expect(mockConsoleClear).toHaveBeenCalled();
    });
  });
});
