import { INVALID_TODO_STATUS_MESSAGE, VALID_TODO_STATUSES } from './validationError';
import { TodoStatus } from './types';

export interface TodoData {
  id: string;
  title: string;
  description: string;
  status: TodoStatus;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class TodoValidator {
  private static readonly VALID_STATUSES: TodoStatus[] = VALID_TODO_STATUSES;

  static validateTitle(title: string): boolean {
    return typeof title === 'string' && title.trim().length > 0;
  }

  static validateStatus(status: string): status is TodoStatus {
    return this.VALID_STATUSES.includes(status as TodoStatus);
  }

  static validateTodoData(data: TodoData): ValidationResult {
    const errors: string[] = [];

    if (!this.validateTitle(data.title)) {
      errors.push('Title cannot be empty');
    }

    if (!this.validateStatus(data.status)) {
      errors.push(INVALID_TODO_STATUS_MESSAGE);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
