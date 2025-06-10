import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { asyncHandler } from '../middleware/errorHandler';

/**
 * @swagger
 * /api/export/companies:
 *   get:
 *     summary: Export companies data
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *         description: Export format
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date filter
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date filter
 *     responses:
 *       200:
 *         description: Data exported successfully
 */
export const exportCompanies = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { format = 'json', startDate, endDate } = req.query;

  // Build where clause
  const where: any = {};

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = new Date(startDate as string);
    }
    if (endDate) {
      where.createdAt.lte = new Date(endDate as string);
    }
  }

  const companies = await prisma.company.findMany({
    where,
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          editorials: true,
          dataEntries: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (format === 'csv') {
    // Convert to CSV format
    const csvHeaders = [
      'ID',
      'Name',
      'Industry',
      'Website',
      'Description',
      'Is Active',
      'Created By',
      'Created At',
      'Editorial Count',
      'Data Entry Count',
    ];

    const csvRows = companies.map(company => [
      company.id,
      company.name,
      company.industry,
      company.website || '',
      company.description || '',
      company.isActive,
      company.createdBy.name,
      company.createdAt.toISOString(),
      company._count.editorials,
      company._count.dataEntries,
    ]);

    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=companies.csv');
    return res.send(csvContent);
  }

  return sendSuccess(res, companies, 'Companies exported successfully');
});

/**
 * @swagger
 * /api/export/editorials:
 *   get:
 *     summary: Export editorials data
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *         description: Export format
 *       - in: query
 *         name: companyId
 *         schema:
 *           type: string
 *         description: Filter by company ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date filter
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date filter
 *     responses:
 *       200:
 *         description: Data exported successfully
 */
export const exportEditorials = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { format = 'json', companyId, startDate, endDate } = req.query;

  // Build where clause
  const where: any = {};

  if (companyId) {
    where.companyId = companyId;
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

  // Role-based filtering
  if (req.user!.role === 'ANALYST') {
    where.analystId = req.user!.id;
  }

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
    orderBy: {
      date: 'desc',
    },
  });

  if (format === 'csv') {
    // Convert to CSV format
    const csvHeaders = [
      'ID',
      'Date',
      'Company',
      'Industry',
      'Brand',
      'Publication',
      'Title',
      'Media Type',
      'Sentiment',
      'Sentiment Index',
      'Audience Reach',
      'Circulation',
      'Analyst',
      'Status',
    ];

    const csvRows = editorials.map(editorial => [
      editorial.id,
      editorial.date.toISOString().split('T')[0],
      editorial.company.name,
      editorial.industry || '',
      editorial.brand || '',
      editorial.publication.name,
      editorial.title || '',
      editorial.mediaType || '',
      editorial.sentiment || '',
      editorial.mediaSentimentIndex || 0,
      editorial.audienceReach || 0,
      editorial.circulation || 0,
      editorial.analyst.name,
      editorial.status,
    ]);

    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=editorials.csv');
    return res.send(csvContent);
  }

  return sendSuccess(res, editorials, 'Editorials exported successfully');
});

/**
 * @swagger
 * /api/export/analytics:
 *   get:
 *     summary: Export analytics data
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [summary, sentiment, mentions]
 *         description: Analytics type to export
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *         description: Export format
 *       - in: query
 *         name: companyId
 *         schema:
 *           type: string
 *         description: Filter by company ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date filter
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date filter
 *     responses:
 *       200:
 *         description: Analytics data exported successfully
 */
export const exportAnalytics = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { type = 'summary', format = 'json', companyId, startDate, endDate } = req.query;

  // Default date range (current month)
  const start = startDate ? new Date(startDate as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const end = endDate ? new Date(endDate as string) : new Date();

  // Build where clause
  const where: any = {
    date: {
      gte: start,
      lte: end,
    },
  };

  if (companyId) {
    where.companyId = companyId;
  }

  // Role-based filtering
  if (req.user!.role === 'ANALYST') {
    where.analystId = req.user!.id;
  }

  let data: any;

  switch (type) {
    case 'sentiment':
      data = await prisma.editorial.groupBy({
        by: ['sentiment'],
        where,
        _count: {
          sentiment: true,
        },
        _avg: {
          mediaSentimentIndex: true,
          audienceReach: true,
        },
      });
      break;

    case 'mentions':
      data = await prisma.editorial.groupBy({
        by: ['companyId'],
        where,
        _count: {
          companyId: true,
        },
        _sum: {
          audienceReach: true,
        },
      });

      // Get company names
      const companyIds = data.map((item: any) => item.companyId);
      const companies = await prisma.company.findMany({
        where: { id: { in: companyIds } },
        select: { id: true, name: true },
      });

      data = data.map((item: any) => ({
        ...item,
        company: companies.find(c => c.id === item.companyId),
      }));
      break;

    default: // summary
      const [totalEditorials, totalDataEntries, sentimentDistribution] = await Promise.all([
        prisma.editorial.count({ where }),
        prisma.dataEntry.count({ where }),
        prisma.editorial.groupBy({
          by: ['sentiment'],
          where,
          _count: { sentiment: true },
        }),
      ]);

      data = {
        totalEditorials,
        totalDataEntries,
        sentimentDistribution,
        dateRange: {
          start: start.toISOString(),
          end: end.toISOString(),
        },
      };
      break;
  }

  if (format === 'csv' && Array.isArray(data)) {
    // Convert to CSV format (simplified for arrays)
    const csvHeaders = Object.keys(data[0] || {});
    const csvRows = data.map(item => csvHeaders.map(header => item[header] || ''));

    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${type}-analytics.csv`);
    return res.send(csvContent);
  }

  return sendSuccess(res, data, `${type} analytics exported successfully`);
});
