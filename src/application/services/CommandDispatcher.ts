import {
  CommandDispatcher as ICommandDispatcher,
  CommandHandler,
  CommandResult,
} from '../../interfaces/application/CommandDispatcher';

export class CommandDispatcher implements ICommandDispatcher {
  private readonly commands: Map<string, CommandHandler> = new Map();

  registerCommand(name: string, handler: CommandHandler): void {
    this.commands.set(name, handler);
  }

  async dispatch(command: string, args: string[]): Promise<CommandResult> {
    const handler = this.commands.get(command);

    if (!handler) {
      return {
        success: false,
        message: `Unknown command: ${command}`,
      };
    }

    try {
      return await handler(args);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: `Command failed: ${errorMessage}`,
      };
    }
  }

  getAvailableCommands(): string[] {
    return Array.from(this.commands.keys()).sort();
  }
}
