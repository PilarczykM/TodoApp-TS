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
      it('should handle file system errors as generic service errors', () => {
        const error = createFileSystemError("ENOENT: no such file or directory, open '/data/todos.json'");
        const result = errorHandler.handleError(error);

        expect(result).toEqual({
          code: 'SERVICE_ERROR',
          message: "ENOENT: no such file or directory, open '/data/todos.json'",
          details: {
            originalError: "ENOENT: no such file or directory, open '/data/todos.json'",
            type: 'generic_error',
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
      it('should handle service errors as generic service errors', () => {
        const error = createServiceError('Todo not found');
        const result = errorHandler.handleError(error);

        expect(result).toEqual({
          code: 'SERVICE_ERROR',
          message: 'Todo not found',
          details: {
            originalError: 'Todo not found',
            type: 'generic_error',
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
});
