import inquirer from 'inquirer';
import chalk from 'chalk';
import { ConsoleInterface, MenuChoice } from '../../interfaces/application/ConsoleInterface';

export class InquirerConsole implements ConsoleInterface {
  displayMessage(message: string, color?: 'green' | 'red' | 'yellow' | 'blue' | 'cyan' | 'magenta'): void {
    const coloredMessage = color ? chalk[color](message) : message;
    console.log(coloredMessage);
  }

  displayError(message: string): void {
    const errorMessage = chalk.red(`❌ ${message}`);
    console.error(errorMessage);
  }

  displaySuccess(message: string): void {
    const successMessage = chalk.green(`✅ ${message}`);
    console.log(successMessage);
  }

  displayWarning(message: string): void {
    const warningMessage = chalk.yellow(`⚠️  ${message}`);
    console.log(warningMessage);
  }

  displayInfo(message: string): void {
    const infoMessage = chalk.blue(`ℹ️  ${message}`);
    console.log(infoMessage);
  }

  displayTable(data: Record<string, unknown>[]): void {
    console.table(data);
  }

  async promptText(message: string, defaultValue?: string): Promise<string> {
    const question = {
      type: 'input' as const,
      name: 'answer',
      message,
      ...(defaultValue && { default: defaultValue }),
    };

    const response = await inquirer.prompt([question]);
    return response.answer as string;
  }

  async promptSelect(message: string, choices: MenuChoice[]): Promise<string> {
    const question = {
      type: 'list' as const,
      name: 'answer',
      message,
      choices,
    };

    const response = await inquirer.prompt([question]);
    return response.answer as string;
  }

  async promptConfirm(message: string, defaultValue?: boolean): Promise<boolean> {
    const question = {
      type: 'confirm' as const,
      name: 'answer',
      message,
      ...(defaultValue !== undefined && { default: defaultValue }),
    };

    const response = await inquirer.prompt([question]);
    return response.answer as boolean;
  }

  clear(): void {
    console.clear();
  }
}
