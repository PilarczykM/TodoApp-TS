export type TodoStatus = 'pending' | 'completed';

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
  private static readonly VALID_STATUSES: TodoStatus[] = ['pending', 'completed'];

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
      errors.push('Status must be either "pending" or "completed"');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
