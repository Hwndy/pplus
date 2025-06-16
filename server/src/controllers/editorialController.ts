import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import { sendSuccess, sendError, sendPaginatedResponse } from '../utils/response';
import { asyncHandler } from '../middleware/errorHandler';
import * as XLSX from 'xlsx';
import path from 'path';

export const getEditorials = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { 
    page = 1, 
    limit = 10, 
    search, 
    companyId, 
    publicationId, 
    mediaType,
    sentiment,
    status, 
    analystId,
    startDate,
    endDate,
    sortBy = 'createdAt', 
    sortOrder = 'desc' 
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  // Build where clause
  const where: any = {};

  if (companyId) {
    where.companyId = companyId;
  }

  if (publicationId) {
    where.publicationId = publicationId;
  }

  if (mediaType) {
    where.mediaType = mediaType;
  }

  if (sentiment) {
    where.sentiment = sentiment;
  }

  if (status) {
    where.status = status;
  }

  if (analystId) {
    where.analystId = analystId;
  }

  if (startDate || endDate) {
    where.date = {};
    if (startDate) {
      where.date.gte = new Date(startDate as string);
    }
    if (endDate) {
      where.date.lte = new Date(endDate as string);
    }
  }

  if (search) {
    where.OR = [
      { title: { contains: search as string, mode: 'insensitive' } },
      { brand: { contains: search as string, mode: 'insensitive' } },
      { reporter: { contains: search as string, mode: 'insensitive' } },
      { spokesperson: { contains: search as string, mode: 'insensitive' } },
      { activity: { contains: search as string, mode: 'insensitive' } },
      { company: { name: { contains: search as string, mode: 'insensitive' } } },
      { publication: { name: { contains: search as string, mode: 'insensitive' } } },
    ];
  }

  // Role-based filtering
  if (req.user!.role === 'ANALYST') {
    where.analystId = req.user!.id;
  }

  // Get total count
  const total = await prisma.editorial.count({ where });

  // Get editorials
  const editorials = await prisma.editorial.findMany({
    where,
    include: {
      company: {
        select: {
          id: true,
          name: true,
          industry: true,
        },
      },
      publication: {
        select: {
          id: true,
          name: true,
          type: true,
          country: true,
        },
      },
      analyst: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    skip,
    take: Number(limit),
    orderBy: {
      [sortBy as string]: sortOrder,
    },
  });

  return sendPaginatedResponse(res, editorials, {
    page: Number(page),
    limit: Number(limit),
    total,
  });
});

export const getEditorialById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const editorial = await prisma.editorial.findUnique({
    where: { id },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          industry: true,
        },
      },
      publication: {
        select: {
          id: true,
          name: true,
          type: true,
          country: true,
        },
      },
      analyst: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!editorial) {
    return sendError(res, 'Editorial not found', 404);
  }

  // Role-based access control
  if (req.user!.role === 'ANALYST' && editorial.analystId !== req.user!.id) {
    return sendError(res, 'Access denied', 403);
  }

  return sendSuccess(res, editorial, 'Editorial retrieved successfully');
});

export const createEditorial = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const {
    date,
    companyId,
    industry,
    brand,
    subSidiary,
    publicationId,
    placement,
    title,
    page,
    link,
    reporter,
    country = 'Nigeria',
    language = 'English',
    spokesperson,
    activity,
    mediaType,
    onlineChannel,
    sentiment,
    mediaSentimentIndex = 0,
    advertSpend = 0,
    circulation = 0,
    audienceReach = 0,
    pageSize,
    analystNote,
    supervisorNote,
    adminNote,
  } = req.body;

  // Verify that the referenced entities exist
  const [company, publication] = await Promise.all([
    prisma.company.findUnique({ where: { id: companyId } }),
    prisma.publication.findUnique({ where: { id: publicationId } }),
  ]);

  if (!company) {
    return sendError(res, 'Company not found', 400);
  }

  if (!publication) {
    return sendError(res, 'Publication not found', 400);
  }

  // Create editorial
  const editorial = await prisma.editorial.create({
    data: {
      date: new Date(date),
      companyId,
      industry,
      brand,
      subSidiary,
      publicationId,
      placement,
      title,
      page,
      link,
      reporter,
      country,
      language,
      spokesperson,
      activity,
      mediaType,
      onlineChannel,
      sentiment,
      mediaSentimentIndex,
      advertSpend,
      circulation,
      audienceReach,
      pageSize,
      analystNote,
      supervisorNote,
      adminNote,
      analystId: req.user!.id,
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          industry: true,
        },
      },
      publication: {
        select: {
          id: true,
          name: true,
          type: true,
          country: true,
        },
      },
      analyst: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return sendSuccess(res, editorial, 'Editorial created successfully', 201);
});

export const updateEditorial = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  // Check if editorial exists
  const existingEditorial = await prisma.editorial.findUnique({
    where: { id },
  });

  if (!existingEditorial) {
    return sendError(res, 'Editorial not found', 404);
  }

  // Role-based access control
  if (req.user!.role === 'ANALYST' && existingEditorial.analystId !== req.user!.id) {
    return sendError(res, 'Access denied', 403);
  }

  // Prepare update data based on user role
  const allowedFields: any = {};

  if (req.user!.role === 'ANALYST') {
    // Analysts can update most fields but not status or supervisor/admin notes
    const analystFields = [
      'date', 'companyId', 'industry', 'brand', 'subSidiary', 'publicationId',
      'placement', 'title', 'page', 'link', 'reporter', 'country', 'language',
      'spokesperson', 'activity', 'mediaType', 'onlineChannel', 'sentiment',
      'mediaSentimentIndex', 'advertSpend', 'circulation', 'audienceReach',
      'pageSize', 'analystNote'
    ];
    
    analystFields.forEach(field => {
      if (updateData[field] !== undefined) {
        allowedFields[field] = field === 'date' ? new Date(updateData[field]) : updateData[field];
      }
    });
  } else {
    // Supervisors and admins can update everything
    Object.keys(updateData).forEach(field => {
      if (field !== 'id' && field !== 'analystId' && field !== 'createdAt' && field !== 'updatedAt') {
        allowedFields[field] = field === 'date' ? new Date(updateData[field]) : updateData[field];
      }
    });
  }

  // Update editorial
  const editorial = await prisma.editorial.update({
    where: { id },
    data: allowedFields,
    include: {
      company: {
        select: {
          id: true,
          name: true,
          industry: true,
        },
      },
      publication: {
        select: {
          id: true,
          name: true,
          type: true,
          country: true,
        },
      },
      analyst: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return sendSuccess(res, editorial, 'Editorial updated successfully');
});

export const deleteEditorial = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  // Check if editorial exists
  const existingEditorial = await prisma.editorial.findUnique({
    where: { id },
  });

  if (!existingEditorial) {
    return sendError(res, 'Editorial not found', 404);
  }

  // Role-based access control
  if (req.user!.role === 'ANALYST' && existingEditorial.analystId !== req.user!.id) {
    return sendError(res, 'Access denied', 403);
  }

  // Delete editorial
  await prisma.editorial.delete({
    where: { id },
  });

  return sendSuccess(res, null, 'Editorial deleted successfully');
});

export const batchUploadEditorials = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) {
    return sendError(res, 'No file uploaded', 400);
  }

  try {
    // Parse Excel file
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (!data || data.length === 0) {
      return sendError(res, 'No data found in the uploaded file', 400);
    }

    let processed = 0;
    let errors = 0;
    const errorDetails: string[] = [];

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row: any = data[i];

      try {
        // Validate required fields
        if (!row.date || !row.company || !row.title || !row.source) {
          errors++;
          errorDetails.push(`Row ${i + 2}: Missing required fields (date, company, title, source)`);
          continue;
        }

        // Find or create company
        let company = await prisma.company.findFirst({
          where: { name: { equals: row.company, mode: 'insensitive' } }
        });

        if (!company) {
          company = await prisma.company.create({
            data: {
              name: row.company,
              industry: row.industry || 'Other',
              description: `Auto-created from batch upload`,
            }
          });
        }

        // Find or create publication (using source field)
        let publication = await prisma.publication.findFirst({
          where: { name: { equals: row.source, mode: 'insensitive' } }
        });

        if (!publication) {
          publication = await prisma.publication.create({
            data: {
              name: row.source,
              type: row.mediaType === 'Online' ? 'ONLINE' : 'PRINT',
              country: row.country || 'Nigeria',
              description: `Auto-created from batch upload`,
            }
          });
        }

        // Create editorial with new fields
        await prisma.editorial.create({
          data: {
            date: new Date(row.date),
            companyId: company.id,
            industry: row.industry || company.industry,
            brand: row.brand || row.company,
            subIndustry: row.subIndustry || '',
            publicationId: publication.id,
            placement: row.placement || 'Article',
            title: row.title,
            printWebClips: row.printWebClips || '',
            reporter: row.reporter || '',
            country: row.country || 'Nigeria',
            language: row.language || 'English',
            spokesperson: row.spokesperson || '',
            ceoMediaPresence: row.ceoMediaPresence || '',
            ceoThoughtLeadership: row.ceoThoughtLeadership || '',
            activity: row.activity || '',
            circulation: row.circulation ? parseInt(row.circulation) : 0,
            audienceReach: row.audienceReach ? parseInt(row.audienceReach) : 0,
            mediaType: row.mediaType || 'Print',
            onlineChannel: row.onlineChannel || '',
            sentiment: row.sentiment || 'Neutral',
            sentimentClassification: row.sentimentClassification || '',
            sentimentScore: row.sentimentScore ? parseFloat(row.sentimentScore) : 0,
            advertSpend: row.advertSpend ? parseFloat(row.advertSpend) : 0,
            pageSize: row.pageSize || '',
            analystNote: row.analystNote || '',
            analystId: req.user!.id,
            status: 'PENDING',
          }
        });

        processed++;
      } catch (error) {
        errors++;
        errorDetails.push(`Row ${i + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return sendSuccess(res, {
      total: data.length,
      processed,
      errors,
      errorDetails: errorDetails.slice(0, 10), // Limit error details to first 10
    }, 'Batch upload completed');

  } catch (error) {
    console.error('Batch upload error:', error);
    return sendError(res, 'Failed to process uploaded file', 500);
  }
});

export const downloadEditorialTemplate = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Create a sample template with headers and example data using new parameters
    const templateData = [
      {
        date: '2024-01-15',
        company: 'Example Company Ltd',
        industry: 'Technology',
        brand: 'Example Brand',
        subIndustry: 'Software',
        source: 'Tech News Daily',
        placement: 'Headline',
        title: 'Example Company Launches New Innovation',
        printWebClips: 'Both Print and Web',
        reporter: 'John Reporter',
        country: 'Nigeria',
        language: 'English',
        spokesperson: 'Jane CEO (CEO, Example Company)',
        ceoMediaPresence: 'High',
        ceoThoughtLeadership: 'Strong',
        activity: 'Product Launch',
        circulation: 100000,
        audienceReach: 250000,
        mediaType: 'Online',
        onlineChannel: 'News Website',
        sentiment: 'Positive',
        sentimentClassification: 'Very Positive',
        sentimentScore: 2.5,
        advertSpend: 50000,
        pageSize: 'Full Page',
        analystNote: 'Positive coverage of product launch'
      }
    ];

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Editorial Template');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=editorial_template.xlsx');

    return res.send(buffer);
  } catch (error) {
    console.error('Template download error:', error);
    return sendError(res, 'Failed to generate template', 500);
  }
});
