import { Request, Response, NextFunction } from 'express';
import { formatErrorResponse, logError, AppError } from '../utils/errors';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Log the error
  logError(err, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Format error response
  const errorResponse = formatErrorResponse(err);

  // Add stack trace in development
  const response: any = { ...errorResponse };
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(errorResponse.statusCode).json(response);
};

export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Export AppError for backward compatibility
export { AppError };
