import { TodoValidator, TodoData } from './todoValidator';
import { TodoStatus } from './types';
import { INVALID_TODO_DATA_MESSAGE, INVALID_TODO_STATUS_MESSAGE, ValidationError } from './validationError';

export interface ITodo {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly status: TodoStatus;
}

export class Todo implements ITodo {
  public readonly id: string;
  public readonly title: string;
  public readonly description: string;
  private _status: TodoStatus;

  constructor(data: TodoData) {
    const validationResult = TodoValidator.validateTodoData(data);

    if (!validationResult.isValid) {
      throw new ValidationError(INVALID_TODO_DATA_MESSAGE, validationResult.errors);
    }

    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this._status = data.status;
  }

  get status(): TodoStatus {
    return this._status;
  }

  updateStatus(newStatus: TodoStatus): void {
    if (!TodoValidator.validateStatus(newStatus)) {
      throw new ValidationError('Invalid status', [INVALID_TODO_STATUS_MESSAGE]);
    }
    this._status = newStatus;
  }

  isCompleted(): boolean {
    return this._status === 'completed';
  }

  markAsCompleted(): void {
    this.updateStatus('completed');
  }

  markAsPending(): void {
    this.updateStatus('pending');
  }

  toData(): TodoData {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      status: this._status,
    };
  }
}
