export type ErrorResult = {
  code: string;
  message: string;
  details: Record<string, unknown>;
};

export interface IErrorHandler {
  handleError(error: unknown): ErrorResult;
}
