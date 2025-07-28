import { ValidationError } from '../../domain/validationError';
import { ErrorResult, IErrorHandler } from '../../interfaces/application/IErrorHandler';

export class ErrorHandler implements IErrorHandler {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly _errorHandlers: Array<[new (...args: any[]) => Error, (error: unknown) => ErrorResult]> = [
    [ValidationError, this.handleValidationError.bind(this)],
    [SyntaxError, this.handleSyntaxError.bind(this)],
    [Error, this.handleGenericError.bind(this)],
  ];

  handleError(error: unknown): ErrorResult {
    for (const [ErrorType, handler] of this._errorHandlers) {
      if (error instanceof ErrorType) {
        return handler(error);
      }
    }

    return this.handleUnknownError(error);
  }

  private handleValidationError(error: unknown): ErrorResult {
    const validationError = error as ValidationError;
    return {
      code: 'VALIDATION_ERROR',
      message: validationError.message,
      details: {
        errors: validationError.errors,
        fieldCount: validationError.errors.length,
      },
    };
  }

  private handleSyntaxError(error: unknown): ErrorResult {
    const syntaxError = error as SyntaxError;
    return {
      code: 'PARSE_ERROR',
      message: 'Failed to parse JSON data',
      details: {
        originalError: syntaxError.message,
        type: 'json_parse_error',
      },
    };
  }

  private handleGenericError(error: unknown): ErrorResult {
    const genericError = error as Error;
    return {
      code: 'SERVICE_ERROR',
      message: genericError.message,
      details: {
        originalError: genericError.message,
        type: 'generic_error',
      },
    };
  }

  private handleUnknownError(error: unknown): ErrorResult {
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
