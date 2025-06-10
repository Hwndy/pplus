// Custom error classes and error handling utilities

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed') {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND_ERROR');
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, 'CONFLICT_ERROR');
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_ERROR');
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500, 'DATABASE_ERROR');
  }
}

export class FileUploadError extends AppError {
  constructor(message: string = 'File upload failed') {
    super(message, 400, 'FILE_UPLOAD_ERROR');
  }
}

// Error factory functions
export const createValidationError = (field: string, value?: any) => {
  return new ValidationError(`Invalid value for field '${field}'${value ? `: ${value}` : ''}`);
};

export const createNotFoundError = (resource: string, id?: string) => {
  return new NotFoundError(`${resource}${id ? ` with id '${id}'` : ''} not found`);
};

export const createConflictError = (resource: string, field: string, value: string) => {
  return new ConflictError(`${resource} with ${field} '${value}' already exists`);
};

export const createAuthenticationError = (reason?: string) => {
  return new AuthenticationError(reason || 'Invalid credentials');
};

export const createAuthorizationError = (action?: string, resource?: string) => {
  const message = action && resource 
    ? `Not authorized to ${action} ${resource}` 
    : 'Access denied';
  return new AuthorizationError(message);
};

// Error response formatter
export const formatErrorResponse = (error: Error): {
  success: boolean;
  error: string;
  code?: string;
  statusCode: number;
} => {
  if (error instanceof AppError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      statusCode: error.statusCode,
    };
  }

  // Handle Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as any;
    
    switch (prismaError.code) {
      case 'P2002':
        return {
          success: false,
          error: 'Unique constraint violation',
          code: 'UNIQUE_CONSTRAINT_ERROR',
          statusCode: 409,
        };
      case 'P2025':
        return {
          success: false,
          error: 'Record not found',
          code: 'RECORD_NOT_FOUND',
          statusCode: 404,
        };
      case 'P2003':
        return {
          success: false,
          error: 'Foreign key constraint violation',
          code: 'FOREIGN_KEY_ERROR',
          statusCode: 400,
        };
      default:
        return {
          success: false,
          error: 'Database operation failed',
          code: 'DATABASE_ERROR',
          statusCode: 500,
        };
    }
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return {
      success: false,
      error: 'Invalid token',
      code: 'INVALID_TOKEN',
      statusCode: 401,
    };
  }

  if (error.name === 'TokenExpiredError') {
    return {
      success: false,
      error: 'Token expired',
      code: 'TOKEN_EXPIRED',
      statusCode: 401,
    };
  }

  // Handle Joi validation errors
  if (error.name === 'ValidationError') {
    return {
      success: false,
      error: error.message,
      code: 'VALIDATION_ERROR',
      statusCode: 400,
    };
  }

  // Default error
  return {
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message,
    code: 'INTERNAL_ERROR',
    statusCode: 500,
  };
};

// Error logging utility
export const logError = (error: Error, context?: any) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    timestamp: new Date().toISOString(),
    context,
  };

  if (error instanceof AppError) {
    errorInfo.statusCode = error.statusCode;
    errorInfo.code = error.code;
    errorInfo.isOperational = error.isOperational;
  }

  console.error('Error occurred:', JSON.stringify(errorInfo, null, 2));
};

// Async error wrapper
export const catchAsync = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Error assertion utilities
export const assertExists = (value: any, message: string) => {
  if (!value) {
    throw new NotFoundError(message);
  }
  return value;
};

export const assertUnique = (exists: boolean, message: string) => {
  if (exists) {
    throw new ConflictError(message);
  }
};

export const assertAuthorized = (condition: boolean, message?: string) => {
  if (!condition) {
    throw new AuthorizationError(message);
  }
};

export const assertValid = (condition: boolean, message: string) => {
  if (!condition) {
    throw new ValidationError(message);
  }
};
