import Joi from 'joi';
import { UserRole, MediaType, SentimentType, ContentStatus, PublicationType } from '@prisma/client';

// User validation schemas
export const userCreateSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid(...Object.values(UserRole)).required(),
  mobileContact: Joi.string().optional(),
  countryCode: Joi.string().optional(),
  supervisorId: Joi.string().optional(),
  expirationDate: Joi.date().optional(),
});

export const userUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  role: Joi.string().valid(...Object.values(UserRole)).optional(),
  mobileContact: Joi.string().optional(),
  countryCode: Joi.string().optional(),
  supervisorId: Joi.string().optional(),
  expirationDate: Joi.date().optional(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE', 'SUSPENDED').optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

// Company validation schemas
export const companyCreateSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  industry: Joi.string().min(2).max(100).required(),
  website: Joi.string().uri().optional().allow(''),
  logo: Joi.string().optional(),
  description: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
});

export const companyUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(200).optional(),
  industry: Joi.string().min(2).max(100).optional(),
  website: Joi.string().uri().optional().allow(''),
  logo: Joi.string().optional(),
  description: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
});

// Publication validation schemas
export const publicationCreateSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  type: Joi.string().valid(...Object.values(PublicationType)).required(),
  website: Joi.string().uri().optional().allow(''),
  country: Joi.string().default('Nigeria'),
  language: Joi.string().default('English'),
  circulation: Joi.number().min(0).default(0),
  isActive: Joi.boolean().default(true),
});

export const publicationUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(200).optional(),
  type: Joi.string().valid(...Object.values(PublicationType)).optional(),
  website: Joi.string().uri().optional().allow(''),
  country: Joi.string().optional(),
  language: Joi.string().optional(),
  circulation: Joi.number().min(0).optional(),
  isActive: Joi.boolean().optional(),
});

// Media Channel validation schemas
export const mediaChannelCreateSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  type: Joi.string().valid(...Object.values(MediaType)).required(),
  category: Joi.string().min(2).max(100).required(),
  description: Joi.string().optional(),
  isActive: Joi.boolean().default(true),
});

export const mediaChannelUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(200).optional(),
  type: Joi.string().valid(...Object.values(MediaType)).optional(),
  category: Joi.string().min(2).max(100).optional(),
  description: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
});

// Data Parameter validation schemas
export const dataParameterCreateSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  category: Joi.string().min(2).max(100).required(),
  description: Joi.string().optional(),
  unit: Joi.string().optional(),
  isActive: Joi.boolean().default(true),
});

export const dataParameterUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(200).optional(),
  category: Joi.string().min(2).max(100).optional(),
  description: Joi.string().optional(),
  unit: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
});

// Data Entry validation schemas
export const dataEntryCreateSchema = Joi.object({
  companyId: Joi.string().required(),
  parameterId: Joi.string().required(),
  channelId: Joi.string().required(),
  value: Joi.number().required(),
  date: Joi.date().required(),
  comments: Joi.string().optional(),
  metadata: Joi.object().optional(),
});

export const dataEntryUpdateSchema = Joi.object({
  companyId: Joi.string().optional(),
  parameterId: Joi.string().optional(),
  channelId: Joi.string().optional(),
  value: Joi.number().optional(),
  date: Joi.date().optional(),
  status: Joi.string().valid(...Object.values(ContentStatus)).optional(),
  comments: Joi.string().optional(),
  metadata: Joi.object().optional(),
});

// Editorial validation schemas
export const editorialCreateSchema = Joi.object({
  date: Joi.date().required(),
  companyId: Joi.string().required(),
  industry: Joi.string().required(),
  brand: Joi.string().required(),
  subSector: Joi.string().optional(),
  publicationId: Joi.string().required(),
  placement: Joi.string().optional(),
  title: Joi.string().required(),
  page: Joi.string().optional(),
  link: Joi.string().uri().optional().allow(''),
  reporter: Joi.string().optional(),
  country: Joi.string().default('Nigeria'),
  language: Joi.string().default('English'),
  spokesperson: Joi.string().optional(),
  activity: Joi.string().optional(),
  mediaType: Joi.string().valid(...Object.values(MediaType)).required(),
  onlineChannel: Joi.string().optional(),
  sentiment: Joi.string().valid(...Object.values(SentimentType)).required(),
  mediaSentimentIndex: Joi.number().min(0).max(5).default(0),
  advertSpend: Joi.number().min(0).default(0),
  circulation: Joi.number().min(0).default(0),
  audienceReach: Joi.number().min(0).default(0),
  pageSize: Joi.string().optional(),
  analystNote: Joi.string().optional(),
  supervisorNote: Joi.string().optional(),
  adminNote: Joi.string().optional(),
});

export const editorialUpdateSchema = Joi.object({
  date: Joi.date().optional(),
  companyId: Joi.string().optional(),
  industry: Joi.string().optional(),
  brand: Joi.string().optional(),
  subSector: Joi.string().optional(),
  publicationId: Joi.string().optional(),
  placement: Joi.string().optional(),
  title: Joi.string().optional(),
  page: Joi.string().optional(),
  link: Joi.string().uri().optional().allow(''),
  reporter: Joi.string().optional(),
  country: Joi.string().optional(),
  language: Joi.string().optional(),
  spokesperson: Joi.string().optional(),
  activity: Joi.string().optional(),
  mediaType: Joi.string().valid(...Object.values(MediaType)).optional(),
  onlineChannel: Joi.string().optional(),
  sentiment: Joi.string().valid(...Object.values(SentimentType)).optional(),
  mediaSentimentIndex: Joi.number().min(0).max(5).optional(),
  advertSpend: Joi.number().min(0).optional(),
  circulation: Joi.number().min(0).optional(),
  audienceReach: Joi.number().min(0).optional(),
  pageSize: Joi.string().optional(),
  analystNote: Joi.string().optional(),
  supervisorNote: Joi.string().optional(),
  adminNote: Joi.string().optional(),
  status: Joi.string().valid(...Object.values(ContentStatus)).optional(),
});

// SWOT Analysis validation schemas
export const swotAnalysisCreateSchema = Joi.object({
  companyId: Joi.string().required(),
  date: Joi.date().required(),
  items: Joi.array().items(
    Joi.object({
      content: Joi.string().required(),
      type: Joi.string().valid('STRENGTH', 'WEAKNESS', 'OPPORTUNITY', 'THREAT').required(),
    })
  ).min(1).required(),
  analystNote: Joi.string().optional(),
  supervisorNote: Joi.string().optional(),
});

export const swotAnalysisUpdateSchema = Joi.object({
  companyId: Joi.string().optional(),
  date: Joi.date().optional(),
  items: Joi.array().items(
    Joi.object({
      id: Joi.string().optional(),
      content: Joi.string().required(),
      type: Joi.string().valid('STRENGTH', 'WEAKNESS', 'OPPORTUNITY', 'THREAT').required(),
    })
  ).optional(),
  analystNote: Joi.string().optional(),
  supervisorNote: Joi.string().optional(),
  status: Joi.string().valid(...Object.values(ContentStatus)).optional(),
});

// Daily Mention validation schemas
export const dailyMentionCreateSchema = Joi.object({
  date: Joi.date().required(),
  companyId: Joi.string().required(),
  title: Joi.string().required(),
  publications: Joi.array().items(Joi.string()).min(1).required(),
  highlights: Joi.array().items(
    Joi.object({
      content: Joi.string().required(),
      type: Joi.string().valid(...Object.values(SentimentType)).required(),
    })
  ).min(1).required(),
  analystNote: Joi.string().optional(),
  supervisorNote: Joi.string().optional(),
});

export const dailyMentionUpdateSchema = Joi.object({
  date: Joi.date().optional(),
  companyId: Joi.string().optional(),
  title: Joi.string().optional(),
  publications: Joi.array().items(Joi.string()).optional(),
  highlights: Joi.array().items(
    Joi.object({
      id: Joi.string().optional(),
      content: Joi.string().required(),
      type: Joi.string().valid(...Object.values(SentimentType)).required(),
    })
  ).optional(),
  analystNote: Joi.string().optional(),
  supervisorNote: Joi.string().optional(),
  status: Joi.string().valid(...Object.values(ContentStatus)).optional(),
});

// Query validation schemas
export const paginationSchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  search: Joi.string().allow('').optional(),
});

export const dateRangeSchema = Joi.object({
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
});

// Extended query schemas for specific endpoints
export const userQuerySchema = paginationSchema.keys({
  role: Joi.string().valid(...Object.values(UserRole)).optional(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE', 'SUSPENDED').optional(),
  search: Joi.string().allow('').optional(), // Override to allow empty strings
});

export const companyQuerySchema = paginationSchema.keys({
  industry: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
  search: Joi.string().allow('').optional(), // Override to allow empty strings
});

export const publicationQuerySchema = paginationSchema.keys({
  type: Joi.string().valid(...Object.values(PublicationType)).optional(),
  country: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
  search: Joi.string().allow('').optional(), // Override to allow empty strings
});

export const dataEntryQuerySchema = paginationSchema.keys({
  companyId: Joi.string().optional(),
  parameterId: Joi.string().optional(),
  channelId: Joi.string().optional(),
  status: Joi.string().valid(...Object.values(ContentStatus)).optional(),
  analystId: Joi.string().optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  search: Joi.string().allow('').optional(), // Override to allow empty strings
});

export const editorialQuerySchema = paginationSchema.keys({
  companyId: Joi.string().optional(),
  publicationId: Joi.string().optional(),
  mediaType: Joi.string().valid(...Object.values(MediaType)).optional(),
  sentiment: Joi.string().valid(...Object.values(SentimentType)).optional(),
  status: Joi.string().valid(...Object.values(ContentStatus)).optional(),
  analystId: Joi.string().optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  search: Joi.string().allow('').optional(), // Override to allow empty strings
});

export const mediaChannelQuerySchema = paginationSchema.keys({
  type: Joi.string().valid(...Object.values(MediaType)).optional(),
  category: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
  search: Joi.string().allow('').optional(), // Override to allow empty strings
});

export const dataParameterQuerySchema = paginationSchema.keys({
  category: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
  search: Joi.string().allow('').optional(), // Override to allow empty strings
});

// Validation middleware
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }
    req.body = value;
    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    const { error, value } = schema.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }
    req.query = value;
    next();
  };
};
