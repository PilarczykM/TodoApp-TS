export type CommandResult = {
  success: boolean;
  message?: string;
  data?: unknown;
};

export type CommandHandler = (args: string[]) => Promise<CommandResult>;

export interface CommandDispatcher {
  registerCommand(name: string, handler: CommandHandler): void;
  dispatch(command: string, args: string[]): Promise<CommandResult>;
  getAvailableCommands(): string[];
}
