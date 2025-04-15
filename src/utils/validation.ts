import { z } from 'zod';

/**
 * Common validation schemas for reuse across forms
 */
export const validationSchemas = {
  // Basic types
  email: z.string().trim().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  phone: z.string().trim().regex(/^\+?[0-9]{10,15}$/, 'Please enter a valid phone number'),
  date: z.date({
    required_error: 'Please select a date',
    invalid_type_error: 'That\'s not a date!',
  }),
  url: z.string().trim().url('Please enter a valid URL'),
  nonEmptyString: z.string().trim().min(1, 'This field cannot be empty'),

  // Numbers
  positiveNumber: z.number().positive('Number must be positive'),
  nonNegativeNumber: z.number().min(0, 'Number cannot be negative'),
  integerNumber: z.number().int('Number must be an integer'),
  percentageNumber: z.number().min(0, 'Percentage must be at least 0').max(100, 'Percentage cannot exceed 100'),

  // Editorial specific
  title: z.string().trim().min(3, 'Title must be at least 3 characters'),
  company: z.string().trim().min(1, 'Company is required'),
  industry: z.string().trim().min(1, 'Industry is required'),
  publication: z.string().trim().min(1, 'Publication is required'),
  mediaType: z.enum(['Print', 'Online'], {
    errorMap: () => ({ message: 'Please select a valid media type' }),
  }),
  sentiment: z.enum(['Positive', 'Negative', 'Neutral'], {
    errorMap: () => ({ message: 'Please select a valid sentiment' }),
  }),

  // Arrays
  nonEmptyArray: z.array(z.any()).min(1, 'Please select at least one item'),
  stringArray: z.array(z.string()),
  numberArray: z.array(z.number()),

  // Optional fields with transformations
  optionalString: z.string().trim().optional(),
  optionalNumber: z.number().optional(),
  optionalDate: z.date().optional(),
  nullableString: z.string().trim().nullable(),

  // Transforms
  stringToNumber: z.string().transform((val) => {
    const parsed = parseFloat(val);
    return isNaN(parsed) ? 0 : parsed;
  }),
  stringToDate: z.string().transform((val) => {
    const date = new Date(val);
    return isNaN(date.getTime()) ? new Date() : date;
  }),
  stringToBoolean: z.string().transform((val) => {
    return val.toLowerCase() === 'true' || val === '1';
  }),
};

/**
 * Helper function to validate a form field
 * @param schema - Zod schema to validate against
 * @param value - Value to validate
 * @returns Object containing validation result
 */
export const validateField = <T>(schema: z.ZodType<T>, value: unknown): {
  valid: boolean;
  error?: string;
  value?: T;
} => {
  try {
    const result = schema.parse(value);
    return { valid: true, value: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        error: error.errors[0]?.message || 'Invalid input'
      };
    }
    return { valid: false, error: 'Validation failed' };
  }
};

/**
 * Safely validate a field without throwing errors
 * @param schema - Zod schema to validate against
 * @param value - Value to validate
 * @returns Validation result or default value
 */
export const safeValidate = <T>(schema: z.ZodType<T>, value: unknown, defaultValue: T): T => {
  try {
    return schema.parse(value);
  } catch (error) {
    return defaultValue;
  }
};

/**
 * Creates a form validator function for a given schema
 * @param schema - Zod schema to validate against
 * @returns A function that validates an object against the schema
 */
export const createFormValidator = <T extends Record<string, unknown>>(schema: z.ZodType<T>) => {
  return (data: unknown): {
    valid: boolean;
    errors: Record<string, string>;
    data?: T;
  } => {
    try {
      const validData = schema.parse(data);
      return { valid: true, errors: {}, data: validData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path.length > 0) {
            const path = err.path.join('.');
            errors[path] = err.message;
          } else {
            // Handle errors without a path (e.g., from refinements)
            errors._form = errors._form || err.message;
          }
        });
        return { valid: false, errors };
      }
      return { valid: false, errors: { _form: 'Form validation failed' } };
    }
  };
};

/**
 * Validate a form with async validation
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Promise with validation result
 */
export const validateFormAsync = async <T extends Record<string, unknown>>(
  schema: z.ZodType<T>,
  data: unknown
): Promise<{
  valid: boolean;
  errors: Record<string, string>;
  data?: T;
}> => {
  try {
    const validData = await schema.parseAsync(data);
    return { valid: true, errors: {}, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach(err => {
        if (err.path.length > 0) {
          const path = err.path.join('.');
          errors[path] = err.message;
        } else {
          errors._form = errors._form || err.message;
        }
      });
      return { valid: false, errors };
    }
    return { valid: false, errors: { _form: 'Form validation failed' } };
  }
};

/**
 * Create a schema for a form with conditional fields
 * @param baseSchema - Base schema for the form
 * @param conditionalSchemas - Object with conditional schemas
 * @param conditionField - Field to check for conditions
 * @returns Combined schema with conditional validation
 */
export const createConditionalSchema = <T extends Record<string, unknown>, U = unknown>(
  baseSchema: z.ZodType<T>,
  conditionalSchemas: Record<string, z.ZodType<U>>,
  conditionField: keyof T
): z.ZodType<T> => {
  return baseSchema.superRefine((data, ctx) => {
    const conditionValue = data[conditionField];
    const conditionalSchema = conditionalSchemas[String(conditionValue)];

    if (conditionalSchema) {
      try {
        conditionalSchema.parse(data);
      } catch (error) {
        if (error instanceof z.ZodError) {
          error.errors.forEach(err => {
            ctx.addIssue(err);
          });
        }
      }
    }

    return z.NEVER;
  });
};

/**
 * Check if a form has any validation errors
 * @param errors - Validation errors object
 * @returns True if there are any errors
 */
export const hasErrors = (errors: Record<string, string | undefined>): boolean => {
  return Object.values(errors).some(error => !!error);
};

/**
 * Get the first error message from a validation errors object
 * @param errors - Validation errors object
 * @returns First error message or undefined
 */
export const getFirstError = (errors: Record<string, string | undefined>): string | undefined => {
  return Object.values(errors).find(error => !!error);
};
