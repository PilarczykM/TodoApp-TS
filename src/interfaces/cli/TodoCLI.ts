import { CLI } from '../application/CLI';
import { ITodoService } from '../application/ITodoService';
import { ConsoleInterface, MenuChoice } from '../application/ConsoleInterface';
import { CommandDispatcher, CommandResult } from '../application/CommandDispatcher';

export class TodoCLI implements CLI {
  private isRunning = false;

  constructor(
    private readonly todoService: ITodoService,
    private readonly console: ConsoleInterface,
    private readonly dispatcher: CommandDispatcher
  ) {
    this.registerCommands();
  }

  async start(): Promise<void> {
    this.isRunning = true;
    this.console.clear();
    this.console.displaySuccess('Welcome to Todo App!');

    while (this.isRunning) {
      try {
        const choice = await this.showMainMenu();
        const result = await this.dispatcher.dispatch(choice, []);

        if (!result.success && result.message) {
          this.console.displayError(result.message);
        }

        // Exit if the command returned exit
        if (result.message === 'exit') {
          break;
        }
      } catch {
        this.console.displayError('An unexpected error occurred');
        break;
      }
    }
  }

  stop(): void {
    this.isRunning = false;
  }

  private async showMainMenu(): Promise<string> {
    const choices: MenuChoice[] = [
      { name: 'Create a new todo', value: 'create' },
      { name: 'List all todos', value: 'list' },
      { name: 'Show a specific todo', value: 'show' },
      { name: 'Update a todo', value: 'update' },
      { name: 'Delete a todo', value: 'delete' },
      { name: 'Mark todo as completed', value: 'complete' },
      { name: 'Mark todo as pending', value: 'pending' },
      { name: 'Show help', value: 'help' },
      { name: 'Exit', value: 'exit' },
    ];

    return await this.console.promptSelect('What would you like to do?', choices);
  }

  private registerCommands(): void {
    this.dispatcher.registerCommand('create', this.handleCreateCommand.bind(this));
    this.dispatcher.registerCommand('list', this.handleListCommand.bind(this));
    this.dispatcher.registerCommand('show', this.handleShowCommand.bind(this));
    this.dispatcher.registerCommand('update', this.handleUpdateCommand.bind(this));
    this.dispatcher.registerCommand('delete', this.handleDeleteCommand.bind(this));
    this.dispatcher.registerCommand('complete', this.handleCompleteCommand.bind(this));
    this.dispatcher.registerCommand('pending', this.handlePendingCommand.bind(this));
    this.dispatcher.registerCommand('help', () => Promise.resolve(this.handleHelpCommand()));
    this.dispatcher.registerCommand('exit', () => Promise.resolve(this.handleExitCommand()));
  }

  private async handleCreateCommand(): Promise<CommandResult> {
    const title = await this.console.promptText('Enter todo title:');
    const description = await this.console.promptText('Enter todo description:');

    const result = await this.todoService.createTodo({ title, description });

    if (result.success) {
      return {
        success: true,
        message: 'Todo created successfully!',
        data: result.data,
      };
    } else {
      return {
        success: false,
        message: result.error,
      };
    }
  }

  private async handleListCommand(): Promise<CommandResult> {
    const result = await this.todoService.getAllTodos();

    if (result.success && result.data) {
      if (result.data.length === 0) {
        this.console.displayInfo('No todos found');
      } else {
        const tableData = result.data.map(todo => ({
          id: todo.id,
          title: todo.title,
          description: todo.description,
          status: todo.status,
        }));
        this.console.displayTable(tableData);
      }

      return {
        success: true,
        message: `Found ${result.data.length} todos`,
        data: result.data,
      };
    } else {
      return {
        success: false,
        message: result.error || 'Failed to retrieve todos',
      };
    }
  }

  private async handleShowCommand(): Promise<CommandResult> {
    const id = await this.console.promptText('Enter todo ID:');
    const result = await this.todoService.getTodoById(id);

    if (result.success && result.data) {
      const tableData = [
        {
          id: result.data.id,
          title: result.data.title,
          description: result.data.description,
          status: result.data.status,
        },
      ];
      this.console.displayTable(tableData);

      return {
        success: true,
        message: 'Todo found',
        data: result.data,
      };
    } else {
      return {
        success: false,
        message: result.error || 'Todo not found',
      };
    }
  }

  private async handleUpdateCommand(): Promise<CommandResult> {
    const id = await this.console.promptText('Enter todo ID:');
    const title = await this.console.promptText('Enter new title (leave empty to keep current):');
    const description = await this.console.promptText('Enter new description (leave empty to keep current):');

    const updateRequest = {
      id,
      ...(title && { title }),
      ...(description && { description }),
    };

    const result = await this.todoService.updateTodo(updateRequest);

    if (result.success) {
      return {
        success: true,
        message: 'Todo updated successfully!',
        data: result.data,
      };
    } else {
      return {
        success: false,
        message: result.error,
      };
    }
  }

  private async handleDeleteCommand(): Promise<CommandResult> {
    const id = await this.console.promptText('Enter todo ID:');
    const confirm = await this.console.promptConfirm('Are you sure you want to delete this todo?', false);

    if (!confirm) {
      return {
        success: true,
        message: 'Delete cancelled',
      };
    }

    const result = await this.todoService.deleteTodo(id);

    if (result.success) {
      return {
        success: true,
        message: 'Todo deleted successfully!',
      };
    } else {
      return {
        success: false,
        message: result.error,
      };
    }
  }

  private async handleCompleteCommand(): Promise<CommandResult> {
    const id = await this.console.promptText('Enter todo ID:');
    const result = await this.todoService.markTodoCompleted(id);

    if (result.success) {
      return {
        success: true,
        message: 'Todo marked as completed!',
        data: result.data,
      };
    } else {
      return {
        success: false,
        message: result.error,
      };
    }
  }

  private async handlePendingCommand(): Promise<CommandResult> {
    const id = await this.console.promptText('Enter todo ID:');
    const result = await this.todoService.markTodoPending(id);

    if (result.success) {
      return {
        success: true,
        message: 'Todo marked as pending!',
        data: result.data,
      };
    } else {
      return {
        success: false,
        message: result.error,
      };
    }
  }

  private handleHelpCommand(): CommandResult {
    this.console.displayInfo('Available commands:');
    const commands = this.dispatcher.getAvailableCommands();

    const commandDescriptions: Record<string, string> = {
      create: 'Create a new todo',
      list: 'List all todos',
      show: 'Show a specific todo by ID',
      update: 'Update an existing todo',
      delete: 'Delete a todo by ID',
      complete: 'Mark a todo as completed',
      pending: 'Mark a todo as pending',
      help: 'Show this help message',
      exit: 'Exit the application',
    };

    commands.forEach(command => {
      const description = commandDescriptions[command] || 'No description available';
      this.console.displayMessage(`  ${command}: ${description}`);
    });

    return {
      success: true,
      message: 'Help displayed',
    };
  }

  private handleExitCommand(): CommandResult {
    this.console.displaySuccess('Thank you for using Todo App! Goodbye!');
    return {
      success: true,
      message: 'exit',
    };
  }
}
