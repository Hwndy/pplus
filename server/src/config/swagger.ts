import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Media Monitoring Dashboard API',
      version: '1.0.0',
      description: 'A comprehensive API for media monitoring and analytics dashboard',
      contact: {
        name: 'Media Monitoring Team',
        email: 'support@mediamonitor.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: process.env.BASE_URL || 'http://localhost:3001',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              example: 'Error message',
            },
            code: {
              type: 'string',
              example: 'ERROR_CODE',
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
            },
            message: {
              type: 'string',
              example: 'Operation successful',
            },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'array',
              items: {
                type: 'object',
              },
            },
            pagination: {
              type: 'object',
              properties: {
                page: {
                  type: 'integer',
                  example: 1,
                },
                limit: {
                  type: 'integer',
                  example: 10,
                },
                total: {
                  type: 'integer',
                  example: 100,
                },
                totalPages: {
                  type: 'integer',
                  example: 10,
                },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'uuid-string',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            name: {
              type: 'string',
              example: 'John Doe',
            },
            role: {
              type: 'string',
              enum: ['ADMIN', 'SUPERVISOR', 'ANALYST', 'CLIENT'],
              example: 'ANALYST',
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
              example: 'ACTIVE',
            },
            avatar: {
              type: 'string',
              nullable: true,
              example: 'https://example.com/avatar.jpg',
            },
            mobileContact: {
              type: 'string',
              nullable: true,
              example: '+1234567890',
            },
            countryCode: {
              type: 'string',
              nullable: true,
              example: '+1',
            },
            supervisorId: {
              type: 'string',
              nullable: true,
              example: 'uuid-string',
            },
            expirationDate: {
              type: 'string',
              format: 'date-time',
              nullable: true,
            },
            lastLogin: {
              type: 'string',
              format: 'date-time',
              nullable: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Company: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'uuid-string',
            },
            name: {
              type: 'string',
              example: 'Acme Corporation',
            },
            industry: {
              type: 'string',
              example: 'Technology',
            },
            website: {
              type: 'string',
              nullable: true,
              example: 'https://acme.com',
            },
            logo: {
              type: 'string',
              nullable: true,
              example: 'https://example.com/logo.jpg',
            },
            description: {
              type: 'string',
              nullable: true,
              example: 'A leading technology company',
            },
            isActive: {
              type: 'boolean',
              example: true,
            },
            createdById: {
              type: 'string',
              example: 'uuid-string',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Publication: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'uuid-string',
            },
            name: {
              type: 'string',
              example: 'Tech News Daily',
            },
            type: {
              type: 'string',
              enum: ['PRINT', 'ONLINE', 'BOTH'],
              example: 'ONLINE',
            },
            website: {
              type: 'string',
              nullable: true,
              example: 'https://technews.com',
            },
            country: {
              type: 'string',
              example: 'Nigeria',
            },
            language: {
              type: 'string',
              example: 'English',
            },
            circulation: {
              type: 'integer',
              example: 50000,
            },
            isActive: {
              type: 'boolean',
              example: true,
            },
            createdById: {
              type: 'string',
              example: 'uuid-string',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'Authentication and authorization endpoints',
      },
      {
        name: 'Users',
        description: 'User management endpoints',
      },
      {
        name: 'Companies',
        description: 'Company management endpoints',
      },
      {
        name: 'Publications',
        description: 'Publication management endpoints',
      },
      {
        name: 'Media Channels',
        description: 'Media channel management endpoints',
      },
      {
        name: 'Data Parameters',
        description: 'Data parameter management endpoints',
      },
      {
        name: 'Data Entries',
        description: 'Data entry management endpoints',
      },
      {
        name: 'Editorials',
        description: 'Editorial content management endpoints',
      },
      {
        name: 'SWOT Analysis',
        description: 'SWOT analysis management endpoints',
      },
      {
        name: 'Daily Mentions',
        description: 'Daily mention management endpoints',
      },
      {
        name: 'Analytics',
        description: 'Analytics and reporting endpoints',
      },
      {
        name: 'File Uploads',
        description: 'File upload and management endpoints',
      },
      {
        name: 'Audit Logs',
        description: 'Audit log and activity tracking endpoints',
      },
    ],
  },
  apis: [
    './src/controllers/*.ts',
    './src/routes/*.ts',
  ],
};

export const specs = swaggerJsdoc(options);
