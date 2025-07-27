import { TodoStatus } from './types';

export const VALID_TODO_STATUSES: TodoStatus[] = ['pending', 'completed'];

export const INVALID_TODO_DATA_MESSAGE = 'Invalid Todo data';
export const INVALID_TODO_STATUS_MESSAGE = `Status must be either '${VALID_TODO_STATUSES.join("' or '")}'`;

export class ValidationError extends Error {
  public readonly errors: string[];

  constructor(message: string, errors: string[] = []) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}
