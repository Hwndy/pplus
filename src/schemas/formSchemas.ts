import { z } from 'zod';
import { validationSchemas } from '@/utils/validation';

/**
 * Editorial form schema
 */
export const editorialSchema = z.object({
  id: z.number().optional(),
  date: validationSchemas.date,
  company: validationSchemas.company,
  industry: validationSchemas.industry,
  brand: validationSchemas.nonEmptyString,
  subSector: validationSchemas.optionalString,
  publication: validationSchemas.publication,
  placement: validationSchemas.optionalString,
  title: validationSchemas.title,
  page: validationSchemas.optionalString,
  link: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  reporter: validationSchemas.optionalString,
  country: z.string().default('Nigeria'),
  language: z.string().default('English'),
  spokesperson: validationSchemas.optionalString,
  activity: validationSchemas.optionalString,
  mediaType: validationSchemas.mediaType,
  onlineChannel: z.string().optional(),
  sentiment: validationSchemas.sentiment,
  mediaSentimentIndex: z.number().min(0).max(5).default(0),
  advertSpend: z.number().min(0).default(0),
  circulation: z.number().min(0).default(0),
  audienceReach: z.number().min(0).default(0),
  pageSize: validationSchemas.optionalString,
  analystNote: validationSchemas.optionalString,
  supervisorNote: validationSchemas.optionalString,
  adminNote: validationSchemas.optionalString,
  status: z.enum(['Pending', 'Approved', 'Rejected']).default('Pending'),
}).refine(
  (data) => {
    // If mediaType is Online, onlineChannel should be provided
    if (data.mediaType === 'Online' && !data.onlineChannel) {
      return false;
    }
    return true;
  },
  {
    message: 'Online channel is required for online media type',
    path: ['onlineChannel'],
  }
);

/**
 * SWOT Mention form schema
 */
export const swotItemSchema = z.object({
  content: z.string().min(1, { message: "Content cannot be empty" })
});

export const swotMentionSchema = z.object({
  company: z.string().min(1, { message: "Company is required" }),
  date: z.date({ required_error: "Date is required" }),
  strengths: z.array(swotItemSchema).min(1, { message: "At least one strength is required" }),
  weaknesses: z.array(swotItemSchema).min(1, { message: "At least one weakness is required" }),
  opportunities: z.array(swotItemSchema).min(1, { message: "At least one opportunity is required" }),
  threats: z.array(swotItemSchema).min(1, { message: "At least one threat is required" }),
  analystNote: z.string().optional(),
  supervisorNote: z.string().optional(),
});

/**
 * Daily Mention form schema
 */
export const dailyMentionSchema = z.object({
  date: z.date({ required_error: "Date is required" }),
  company: z.string().min(1, { message: "Company is required" }),
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  highlights: z.array(z.object({
    content: z.string().min(1, { message: "Highlight content is required" }),
    type: z.enum(['positive', 'negative', 'neutral']),
  })).min(1, { message: "At least one highlight is required" }),
  publications: z.array(z.string()).min(1, { message: "At least one publication is required" }),
  analystNote: z.string().optional(),
  supervisorNote: z.string().optional(),
});

/**
 * User form schema
 */
export const userSchema = z.object({
  name: validationSchemas.name,
  email: validationSchemas.email,
  role: z.enum(['admin', 'supervisor', 'analyst', 'client']),
  password: validationSchemas.password.optional(),
  confirmPassword: z.string().optional(),
}).refine(
  (data) => {
    // If password is provided, confirmPassword should match
    if (data.password && data.password !== data.confirmPassword) {
      return false;
    }
    return true;
  },
  {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }
);

/**
 * Login form schema
 */
export const loginSchema = z.object({
  email: validationSchemas.email,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

/**
 * Company form schema
 */
export const companySchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  industry: z.string().min(1, 'Industry is required'),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  logo: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

/**
 * Publication form schema
 */
export const publicationSchema = z.object({
  name: z.string().min(2, 'Publication name must be at least 2 characters'),
  type: z.enum(['Print', 'Online', 'Both']),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  country: z.string().default('Nigeria'),
  language: z.string().default('English'),
  circulation: z.number().min(0).default(0),
  isActive: z.boolean().default(true),
});

// Export types derived from schemas
export type Editorial = z.infer<typeof editorialSchema>;
export type SwotMention = z.infer<typeof swotMentionSchema>;
export type DailyMention = z.infer<typeof dailyMentionSchema>;
export type User = z.infer<typeof userSchema>;
export type LoginForm = z.infer<typeof loginSchema>;
export type Company = z.infer<typeof companySchema>;
export type Publication = z.infer<typeof publicationSchema>;
