// Application constants

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  SUPERVISOR: 'SUPERVISOR',
  ANALYST: 'ANALYST',
  CLIENT: 'CLIENT',
} as const;

export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
} as const;

export const MEDIA_TYPES = {
  PRINT: 'PRINT',
  ONLINE: 'ONLINE',
  TELEVISION: 'TELEVISION',
  RADIO: 'RADIO',
  SOCIAL_MEDIA: 'SOCIAL_MEDIA',
} as const;

export const SENTIMENT_TYPES = {
  POSITIVE: 'POSITIVE',
  NEGATIVE: 'NEGATIVE',
  NEUTRAL: 'NEUTRAL',
  NA: 'NA',
} as const;

export const CONTENT_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  DRAFT: 'DRAFT',
} as const;

export const PUBLICATION_TYPES = {
  PRINT: 'PRINT',
  ONLINE: 'ONLINE',
  BOTH: 'BOTH',
} as const;

export const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
} as const;

export const API_MESSAGES = {
  SUCCESS: {
    LOGIN: 'Login successful',
    LOGOUT: 'Logout successful',
    CREATED: 'Created successfully',
    UPDATED: 'Updated successfully',
    DELETED: 'Deleted successfully',
    RETRIEVED: 'Retrieved successfully',
  },
  ERROR: {
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access forbidden',
    NOT_FOUND: 'Resource not found',
    VALIDATION_ERROR: 'Validation error',
    INTERNAL_ERROR: 'Internal server error',
    INVALID_CREDENTIALS: 'Invalid credentials',
    USER_EXISTS: 'User already exists',
    INVALID_TOKEN: 'Invalid or expired token',
  },
} as const;
