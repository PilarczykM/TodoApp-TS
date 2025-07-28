import { ValidationError } from '../domain/validationError';

export type ErrorResult = {
  code: string;
  message: string;
  details: Record<string, unknown>;
};

export interface IErrorHandler {
  handleError(error: unknown): ErrorResult;
}

export class ErrorHandler implements IErrorHandler {
  handleError(error: unknown): ErrorResult {
    if (error instanceof ValidationError) {
      return {
        code: 'VALIDATION_ERROR',
        message: error.message,
        details: {
          errors: error.errors,
          fieldCount: error.errors.length,
        },
      };
    }

    if (error instanceof SyntaxError) {
      return {
        code: 'PARSE_ERROR',
        message: 'Failed to parse JSON data',
        details: {
          originalError: error.message,
          type: 'json_parse_error',
        },
      };
    }

    if (error instanceof Error) {
      return {
        code: 'SERVICE_ERROR',
        message: error.message,
        details: {
          originalError: error.message,
          type: 'generic_error',
        },
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred',
      details: {
        originalError: error,
        type: 'unknown',
      },
    };
  }
}
