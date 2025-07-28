export type MenuChoice = {
  name: string;
  value: string;
};

export type PromptOptions = {
  message: string;
  choices?: MenuChoice[];
  default?: string;
};

export interface ConsoleInterface {
  displayMessage(message: string, color?: 'green' | 'red' | 'yellow' | 'blue' | 'cyan' | 'magenta'): void;
  displayError(message: string): void;
  displaySuccess(message: string): void;
  displayWarning(message: string): void;
  displayInfo(message: string): void;
  displayTable(data: Record<string, unknown>[]): void;
  promptText(message: string, defaultValue?: string): Promise<string>;
  promptSelect(message: string, choices: MenuChoice[]): Promise<string>;
  promptConfirm(message: string, defaultValue?: boolean): Promise<boolean>;
  clear(): void;
}
