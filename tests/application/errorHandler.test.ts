import { ValidationError } from '../../src/domain/validationError';
import { ErrorHandler } from '../../src/application/errorHandler';

// Test data factories
const createFileSystemError = (message: string = 'ENOENT: no such file or directory'): Error => {
  const error = new Error(message);
  (error as any).code = 'ENOENT';
  (error as any).errno = -2;
  (error as any).syscall = 'open';
  (error as any).path = '/path/to/file';
  return error;
};

const createValidationError = (message: string = 'Invalid data', errors: string[] = []): ValidationError => {
  return new ValidationError(message, errors);
};

const createJsonParseError = (message: string = 'Unexpected token in JSON'): SyntaxError => {
  return new SyntaxError(message);
};

const createServiceError = (message: string = 'Todo not found'): Error => {
  return new Error(message);
};

const createUnknownError = (): unknown => {
  return { message: 'Unknown error type', stack: 'some stack trace' };
};

describe('ErrorHandler', () => {
  let errorHandler: ErrorHandler;

  beforeEach(() => {
    errorHandler = new ErrorHandler();
  });

  describe('handleError', () => {
    describe('I/O errors (file system operations)', () => {
      it('should handle file not found errors', () => {
        const error = createFileSystemError("ENOENT: no such file or directory, open '/data/todos.json'");
        const result = errorHandler.handleError(error);

        expect(result).toEqual({
          code: 'IO_ERROR',
          message: 'File system operation failed',
          details: {
            originalError: "ENOENT: no such file or directory, open '/data/todos.json'",
            type: 'file_not_found',
            path: '/path/to/file',
          },
        });
      });

      it('should handle permission denied errors', () => {
        const error = createFileSystemError("EACCES: permission denied, open '/protected/file'");
        (error as any).code = 'EACCES';
        const result = errorHandler.handleError(error);

        expect(result).toEqual({
          code: 'IO_ERROR',
          message: 'File system operation failed',
          details: {
            originalError: "EACCES: permission denied, open '/protected/file'",
            type: 'permission_denied',
            path: '/path/to/file',
          },
        });
      });

      it('should handle disk space errors', () => {
        const error = createFileSystemError('ENOSPC: no space left on device');
        (error as any).code = 'ENOSPC';
        const result = errorHandler.handleError(error);

        expect(result).toEqual({
          code: 'IO_ERROR',
          message: 'File system operation failed',
          details: {
            originalError: 'ENOSPC: no space left on device',
            type: 'disk_full',
            path: '/path/to/file',
          },
        });
      });

      it('should handle generic file system errors', () => {
        const error = createFileSystemError('EIO: i/o error, read');
        (error as any).code = 'EIO';
        const result = errorHandler.handleError(error);

        expect(result).toEqual({
          code: 'IO_ERROR',
          message: 'File system operation failed',
          details: {
            originalError: 'EIO: i/o error, read',
            type: 'io_error',
            path: '/path/to/file',
          },
        });
      });
    });

    describe('validation errors', () => {
      it('should handle ValidationError with single error', () => {
        const error = createValidationError('Invalid Todo data', ['Title cannot be empty']);
        const result = errorHandler.handleError(error);

        expect(result).toEqual({
          code: 'VALIDATION_ERROR',
          message: 'Invalid Todo data',
          details: {
            errors: ['Title cannot be empty'],
            fieldCount: 1,
          },
        });
      });

      it('should handle ValidationError with multiple errors', () => {
        const error = createValidationError('Invalid Todo data', [
          'Title cannot be empty',
          "Status must be either 'pending' or 'completed'",
        ]);
        const result = errorHandler.handleError(error);

        expect(result).toEqual({
          code: 'VALIDATION_ERROR',
          message: 'Invalid Todo data',
          details: {
            errors: ['Title cannot be empty', "Status must be either 'pending' or 'completed'"],
            fieldCount: 2,
          },
        });
      });

      it('should handle ValidationError with no specific errors', () => {
        const error = createValidationError('General validation failure');
        const result = errorHandler.handleError(error);

        expect(result).toEqual({
          code: 'VALIDATION_ERROR',
          message: 'General validation failure',
          details: {
            errors: [],
            fieldCount: 0,
          },
        });
      });
    });

    describe('JSON parsing errors', () => {
      it('should handle JSON syntax errors', () => {
        const error = createJsonParseError('Unexpected token } in JSON at position 12');
        const result = errorHandler.handleError(error);

        expect(result).toEqual({
          code: 'PARSE_ERROR',
          message: 'Failed to parse JSON data',
          details: {
            originalError: 'Unexpected token } in JSON at position 12',
            type: 'json_parse_error',
          },
        });
      });

      it('should handle JSON unexpected end of input', () => {
        const error = createJsonParseError('Unexpected end of JSON input');
        const result = errorHandler.handleError(error);

        expect(result).toEqual({
          code: 'PARSE_ERROR',
          message: 'Failed to parse JSON data',
          details: {
            originalError: 'Unexpected end of JSON input',
            type: 'json_parse_error',
          },
        });
      });
    });

    describe('service errors (repository operations)', () => {
      it('should handle todo not found errors', () => {
        const error = createServiceError('Todo not found');
        const result = errorHandler.handleError(error);

        expect(result).toEqual({
          code: 'SERVICE_ERROR',
          message: 'Todo not found',
          details: {
            type: 'not_found',
            operation: 'todo_operation',
          },
        });
      });

      it('should handle generic service errors', () => {
        const error = createServiceError('Repository operation failed');
        const result = errorHandler.handleError(error);

        expect(result).toEqual({
          code: 'SERVICE_ERROR',
          message: 'Repository operation failed',
          details: {
            type: 'operation_failed',
            operation: 'repository_operation',
          },
        });
      });
    });

    describe('unknown errors', () => {
      it('should handle non-Error objects', () => {
        const error = createUnknownError();
        const result = errorHandler.handleError(error);

        expect(result).toEqual({
          code: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred',
          details: {
            originalError: error,
            type: 'unknown',
          },
        });
      });

      it('should handle null errors', () => {
        const result = errorHandler.handleError(null);

        expect(result).toEqual({
          code: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred',
          details: {
            originalError: null,
            type: 'unknown',
          },
        });
      });

      it('should handle undefined errors', () => {
        const result = errorHandler.handleError(undefined);

        expect(result).toEqual({
          code: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred',
          details: {
            originalError: undefined,
            type: 'unknown',
          },
        });
      });

      it('should handle string errors', () => {
        const result = errorHandler.handleError('Something went wrong');

        expect(result).toEqual({
          code: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred',
          details: {
            originalError: 'Something went wrong',
            type: 'unknown',
          },
        });
      });
    });
  });

  describe('isRetryableError', () => {
    it('should return true for temporary I/O errors', () => {
      const error = createFileSystemError('EAGAIN: resource temporarily unavailable');
      (error as any).code = 'EAGAIN';
      const result = errorHandler.handleError(error);

      expect(errorHandler.isRetryableError(result)).toBe(true);
    });

    it('should return true for network timeout errors', () => {
      const error = createFileSystemError('ETIMEDOUT: connection timed out');
      (error as any).code = 'ETIMEDOUT';
      const result = errorHandler.handleError(error);

      expect(errorHandler.isRetryableError(result)).toBe(true);
    });

    it('should return false for validation errors', () => {
      const error = createValidationError('Invalid data');
      const result = errorHandler.handleError(error);

      expect(errorHandler.isRetryableError(result)).toBe(false);
    });

    it('should return false for permission errors', () => {
      const error = createFileSystemError('EACCES: permission denied');
      (error as any).code = 'EACCES';
      const result = errorHandler.handleError(error);

      expect(errorHandler.isRetryableError(result)).toBe(false);
    });

    it('should return false for not found errors', () => {
      const error = createServiceError('Todo not found');
      const result = errorHandler.handleError(error);

      expect(errorHandler.isRetryableError(result)).toBe(false);
    });
  });

  describe('getErrorSeverity', () => {
    it('should return critical for disk space errors', () => {
      const error = createFileSystemError('ENOSPC: no space left on device');
      (error as any).code = 'ENOSPC';
      const result = errorHandler.handleError(error);

      expect(errorHandler.getErrorSeverity(result)).toBe('critical');
    });

    it('should return high for permission errors', () => {
      const error = createFileSystemError('EACCES: permission denied');
      (error as any).code = 'EACCES';
      const result = errorHandler.handleError(error);

      expect(errorHandler.getErrorSeverity(result)).toBe('high');
    });

    it('should return medium for validation errors', () => {
      const error = createValidationError('Invalid data');
      const result = errorHandler.handleError(error);

      expect(errorHandler.getErrorSeverity(result)).toBe('medium');
    });

    it('should return low for not found errors', () => {
      const error = createServiceError('Todo not found');
      const result = errorHandler.handleError(error);

      expect(errorHandler.getErrorSeverity(result)).toBe('low');
    });

    it('should return medium for unknown errors', () => {
      const result = errorHandler.handleError(createUnknownError());

      expect(errorHandler.getErrorSeverity(result)).toBe('medium');
    });
  });

  describe('formatErrorForUser', () => {
    it('should format I/O errors for user display', () => {
      const error = createFileSystemError('ENOENT: no such file or directory');
      const result = errorHandler.handleError(error);
      const formatted = errorHandler.formatErrorForUser(result);

      expect(formatted).toBe(
        'Unable to access the file. Please check if the file exists and you have permission to read it.'
      );
    });

    it('should format validation errors for user display', () => {
      const error = createValidationError('Invalid Todo data', ['Title cannot be empty']);
      const result = errorHandler.handleError(error);
      const formatted = errorHandler.formatErrorForUser(result);

      expect(formatted).toBe('Invalid input: Title cannot be empty');
    });

    it('should format multiple validation errors for user display', () => {
      const error = createValidationError('Invalid Todo data', [
        'Title cannot be empty',
        "Status must be either 'pending' or 'completed'",
      ]);
      const result = errorHandler.handleError(error);
      const formatted = errorHandler.formatErrorForUser(result);

      expect(formatted).toBe("Invalid input: Title cannot be empty, Status must be either 'pending' or 'completed'");
    });

    it('should format JSON parse errors for user display', () => {
      const error = createJsonParseError('Unexpected token } in JSON');
      const result = errorHandler.handleError(error);
      const formatted = errorHandler.formatErrorForUser(result);

      expect(formatted).toBe(
        'The data file appears to be corrupted. Please check the file format or restore from backup.'
      );
    });

    it('should format service errors for user display', () => {
      const error = createServiceError('Todo not found');
      const result = errorHandler.handleError(error);
      const formatted = errorHandler.formatErrorForUser(result);

      expect(formatted).toBe('The requested todo item could not be found.');
    });

    it('should format unknown errors for user display', () => {
      const result = errorHandler.handleError(createUnknownError());
      const formatted = errorHandler.formatErrorForUser(result);

      expect(formatted).toBe(
        'An unexpected error occurred. Please try again or contact support if the problem persists.'
      );
    });
  });

  describe('error chaining', () => {
    it('should handle nested errors correctly', () => {
      const innerError = createValidationError('Invalid title');
      const outerError = new Error('Failed to save todo');
      (outerError as any).cause = innerError;

      const result = errorHandler.handleError(outerError);

      expect(result.code).toBe('SERVICE_ERROR');
      expect(result.details).toHaveProperty('cause');
      expect(result.details.cause).toEqual({
        code: 'VALIDATION_ERROR',
        message: 'Invalid title',
        details: {
          errors: [],
          fieldCount: 0,
        },
      });
    });
  });

  describe('error context', () => {
    it('should preserve error context information', () => {
      const error = createFileSystemError("ENOENT: no such file or directory, open '/data/todos.json'");
      (error as any).operation = 'read_todos';
      (error as any).timestamp = '2023-01-01T00:00:00Z';

      const result = errorHandler.handleError(error);

      expect(result.details).toHaveProperty('context');
      expect(result.details.context).toEqual({
        operation: 'read_todos',
        timestamp: '2023-01-01T00:00:00Z',
      });
    });
  });
});
