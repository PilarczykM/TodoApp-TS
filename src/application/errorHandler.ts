import { ValidationError } from '../domain/validationError';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export type ErrorResult = {
  code: string;
  message: string;
  details: Record<string, unknown>;
};

interface NodeError extends Error {
  code?: string;
  errno?: number;
  syscall?: string;
  path?: string;
  operation?: string;
  timestamp?: string;
  cause?: unknown;
}

// Error codes
const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  PARSE_ERROR: 'PARSE_ERROR',
  IO_ERROR: 'IO_ERROR',
  SERVICE_ERROR: 'SERVICE_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

// Node.js error code mappings
const NODE_ERROR_TYPES = {
  ENOENT: 'file_not_found',
  EACCES: 'permission_denied',
  ENOSPC: 'disk_full',
} as const;

// Error messages
const ERROR_MESSAGES = {
  FILE_SYSTEM_FAILED: 'File system operation failed',
  JSON_PARSE_FAILED: 'Failed to parse JSON data',
  UNEXPECTED_ERROR: 'An unexpected error occurred',
} as const;

// User-friendly messages
const USER_MESSAGES = {
  IO_ERROR: 'Unable to access the file. Please check if the file exists and you have permission to read it.',
  VALIDATION_EMPTY: 'Invalid input provided.',
  PARSE_ERROR: 'The data file appears to be corrupted. Please check the file format or restore from backup.',
  SERVICE_NOT_FOUND: 'The requested todo item could not be found.',
  SERVICE_GENERIC: 'A service error occurred while processing your request.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again or contact support if the problem persists.',
  DEFAULT: 'An error occurred while processing your request.',
} as const;

// Retryable error patterns
const RETRYABLE_PATTERNS = ['EAGAIN', 'ETIMEDOUT'] as const;

export interface IErrorHandler {
  handleError(error: unknown): ErrorResult;
  isRetryableError(errorResult: ErrorResult): boolean;
  getErrorSeverity(errorResult: ErrorResult): ErrorSeverity;
  formatErrorForUser(errorResult: ErrorResult): string;
}

export class ErrorHandler implements IErrorHandler {
  handleError(error: unknown): ErrorResult {
    if (error instanceof ValidationError) {
      return this.createValidationErrorResult(error);
    }

    if (error instanceof SyntaxError) {
      return this.createParseErrorResult(error);
    }

    if (error instanceof Error) {
      const nodeError = error as NodeError;

      if (nodeError.code) {
        return this.createIOErrorResult(nodeError);
      }

      return this.createServiceErrorResult(nodeError);
    }

    return this.createUnknownErrorResult(error);
  }

  private createValidationErrorResult(error: ValidationError): ErrorResult {
    return {
      code: ERROR_CODES.VALIDATION_ERROR,
      message: error.message,
      details: {
        errors: error.errors,
        fieldCount: error.errors.length,
      },
    };
  }

  private createParseErrorResult(error: SyntaxError): ErrorResult {
    return {
      code: ERROR_CODES.PARSE_ERROR,
      message: ERROR_MESSAGES.JSON_PARSE_FAILED,
      details: {
        originalError: error.message,
        type: 'json_parse_error',
      },
    };
  }

  private createIOErrorResult(nodeError: NodeError): ErrorResult {
    const type = this.getIOErrorType(nodeError.code!);
    const details = this.buildErrorDetails(
      {
        originalError: nodeError.message,
        type,
        path: nodeError.path || '',
      },
      nodeError
    );

    return {
      code: ERROR_CODES.IO_ERROR,
      message: ERROR_MESSAGES.FILE_SYSTEM_FAILED,
      details,
    };
  }

  private createServiceErrorResult(nodeError: NodeError): ErrorResult {
    const isNotFound = nodeError.message.includes('not found');
    const baseDetails = isNotFound
      ? { type: 'not_found', operation: 'todo_operation' }
      : { type: 'operation_failed', operation: 'repository_operation' };

    const details = this.buildErrorDetails(baseDetails, nodeError);

    return {
      code: ERROR_CODES.SERVICE_ERROR,
      message: nodeError.message,
      details,
    };
  }

  private createUnknownErrorResult(error: unknown): ErrorResult {
    return {
      code: ERROR_CODES.UNKNOWN_ERROR,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR,
      details: {
        originalError: error,
        type: 'unknown',
      },
    };
  }

  private getIOErrorType(code: string): string {
    return NODE_ERROR_TYPES[code as keyof typeof NODE_ERROR_TYPES] || 'io_error';
  }

  private buildErrorDetails(baseDetails: Record<string, unknown>, nodeError: NodeError): Record<string, unknown> {
    const details = { ...baseDetails };

    this.addContextIfPresent(details, nodeError);
    this.addCauseIfPresent(details, nodeError);

    return details;
  }

  private addContextIfPresent(details: Record<string, unknown>, nodeError: NodeError): void {
    if (nodeError.operation || nodeError.timestamp) {
      details.context = {};
      const context = details.context as Record<string, unknown>;
      if (nodeError.operation) context.operation = nodeError.operation;
      if (nodeError.timestamp) context.timestamp = nodeError.timestamp;
    }
  }

  private addCauseIfPresent(details: Record<string, unknown>, nodeError: NodeError): void {
    if (nodeError.cause) {
      details.cause = this.handleError(nodeError.cause);
    }
  }

  isRetryableError(errorResult: ErrorResult): boolean {
    if (errorResult.code === ERROR_CODES.IO_ERROR) {
      const errorType = errorResult.details.type as string;
      const originalError = errorResult.details.originalError as string;
      return errorType === 'io_error' && RETRYABLE_PATTERNS.some(pattern => originalError.includes(pattern));
    }
    return false;
  }

  getErrorSeverity(errorResult: ErrorResult): ErrorSeverity {
    if (errorResult.code === ERROR_CODES.IO_ERROR) {
      const errorType = errorResult.details.type as string;
      if (errorType === 'disk_full') return 'critical';
      if (errorType === 'permission_denied') return 'high';
    }

    if (errorResult.code === ERROR_CODES.VALIDATION_ERROR) return 'medium';
    if (errorResult.code === ERROR_CODES.SERVICE_ERROR && errorResult.details.type === 'not_found') return 'low';
    if (errorResult.code === ERROR_CODES.UNKNOWN_ERROR) return 'medium';

    return 'medium';
  }

  formatErrorForUser(errorResult: ErrorResult): string {
    switch (errorResult.code) {
      case ERROR_CODES.IO_ERROR:
        return USER_MESSAGES.IO_ERROR;

      case ERROR_CODES.VALIDATION_ERROR:
        return this.formatValidationErrorMessage(errorResult);

      case ERROR_CODES.PARSE_ERROR:
        return USER_MESSAGES.PARSE_ERROR;

      case ERROR_CODES.SERVICE_ERROR:
        return this.formatServiceErrorMessage(errorResult);

      case ERROR_CODES.UNKNOWN_ERROR:
        return USER_MESSAGES.UNKNOWN_ERROR;

      default:
        return USER_MESSAGES.DEFAULT;
    }
  }

  private formatValidationErrorMessage(errorResult: ErrorResult): string {
    const errors = (errorResult.details.errors as string[]) || [];
    if (errors.length === 0) {
      return USER_MESSAGES.VALIDATION_EMPTY;
    }
    return `Invalid input: ${errors.join(', ')}`;
  }

  private formatServiceErrorMessage(errorResult: ErrorResult): string {
    if (errorResult.details.type === 'not_found') {
      return USER_MESSAGES.SERVICE_NOT_FOUND;
    }
    return USER_MESSAGES.SERVICE_GENERIC;
  }
}
