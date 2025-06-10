import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { asyncHandler } from '../middleware/errorHandler';
import { startOfMonth, endOfMonth, subMonths, format, startOfWeek, endOfWeek } from 'date-fns';

export const getDashboardSummary = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { companyId, startDate, endDate } = req.query;

  // Default date range (current month)
  const start = startDate ? new Date(startDate as string) : startOfMonth(new Date());
  const end = endDate ? new Date(endDate as string) : endOfMonth(new Date());

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

  // Get counts
  const [
    totalDataEntries,
    totalEditorials,
    totalSwotAnalyses,
    totalDailyMentions,
    pendingDataEntries,
    approvedDataEntries,
    rejectedDataEntries,
    companies,
    publications,
    mediaChannels,
  ] = await Promise.all([
    prisma.dataEntry.count({ where }),
    prisma.editorial.count({ where }),
    prisma.swotAnalysis.count({ where }),
    prisma.dailyMention.count({ where }),
    prisma.dataEntry.count({ where: { ...where, status: 'PENDING' } }),
    prisma.dataEntry.count({ where: { ...where, status: 'APPROVED' } }),
    prisma.dataEntry.count({ where: { ...where, status: 'REJECTED' } }),
    prisma.company.count({ where: { isActive: true } }),
    prisma.publication.count({ where: { isActive: true } }),
    prisma.mediaChannel.count({ where: { isActive: true } }),
  ]);

  // Get sentiment distribution
  const sentimentDistribution = await prisma.editorial.groupBy({
    by: ['sentiment'],
    where,
    _count: {
      sentiment: true,
    },
  });

  // Get media type distribution
  const mediaTypeDistribution = await prisma.editorial.groupBy({
    by: ['mediaType'],
    where,
    _count: {
      mediaType: true,
    },
  });

  // Get top companies by mentions
  const topCompanies = await prisma.editorial.groupBy({
    by: ['companyId'],
    where,
    _count: {
      companyId: true,
    },
    orderBy: {
      _count: {
        companyId: 'desc',
      },
    },
    take: 5,
  });

  // Get company names for top companies
  const companyIds = topCompanies.map(tc => tc.companyId);
  const companyNames = await prisma.company.findMany({
    where: { id: { in: companyIds } },
    select: { id: true, name: true },
  });

  const topCompaniesWithNames = topCompanies.map(tc => ({
    ...tc,
    company: companyNames.find(c => c.id === tc.companyId),
  }));

  const summary = {
    totalDataEntries,
    totalEditorials,
    totalSwotAnalyses,
    totalDailyMentions,
    pendingDataEntries,
    approvedDataEntries,
    rejectedDataEntries,
    totalCompanies: companies,
    totalPublications: publications,
    totalMediaChannels: mediaChannels,
    sentimentDistribution,
    mediaTypeDistribution,
    topCompanies: topCompaniesWithNames,
    dateRange: {
      start: start.toISOString(),
      end: end.toISOString(),
    },
  };

  return sendSuccess(res, summary, 'Dashboard summary retrieved successfully');
});

export const getMentionsTrend = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { companyId, months = 6 } = req.query;

  const monthsCount = parseInt(months as string);
  const endDate = new Date();
  const startDate = subMonths(endDate, monthsCount);

  // Build where clause
  const where: any = {
    date: {
      gte: startDate,
      lte: endDate,
    },
  };

  if (companyId) {
    where.companyId = companyId;
  }

  // Role-based filtering
  if (req.user!.role === 'ANALYST') {
    where.analystId = req.user!.id;
  }

  // Get monthly mentions count using aggregation instead of raw SQL
  const monthlyMentions = await prisma.editorial.groupBy({
    by: ['date'],
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
      ...(companyId && { companyId }),
      ...(req.user!.role === 'ANALYST' && { analystId: req.user!.id }),
    },
    _count: {
      id: true,
    },
    orderBy: {
      date: 'asc',
    },
  });

  // Format the data - group by month manually since Prisma doesn't support DATE_TRUNC
  const monthlyData: { [key: string]: number } = {};

  monthlyMentions.forEach(item => {
    const monthKey = format(new Date(item.date), 'MMM yyyy');
    monthlyData[monthKey] = (monthlyData[monthKey] || 0) + item._count.id;
  });

  const formattedData = Object.entries(monthlyData).map(([month, count]) => ({
    month,
    count,
  }));

  return sendSuccess(res, formattedData, 'Mentions trend retrieved successfully');
});

export const getSentimentAnalysis = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { companyId, startDate, endDate } = req.query;

  // Default date range (current month)
  const start = startDate ? new Date(startDate as string) : startOfMonth(new Date());
  const end = endDate ? new Date(endDate as string) : endOfMonth(new Date());

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

  // Get sentiment distribution with additional metrics
  const sentimentData = await prisma.editorial.groupBy({
    by: ['sentiment'],
    where,
    _count: {
      sentiment: true,
    },
    _avg: {
      mediaSentimentIndex: true,
      audienceReach: true,
    },
    _sum: {
      audienceReach: true,
    },
  });

  // Get sentiment trend over time using Prisma aggregation
  const sentimentTrend = await prisma.editorial.groupBy({
    by: ['sentiment', 'date'],
    where,
    _count: {
      sentiment: true,
    },
    _avg: {
      mediaSentimentIndex: true,
    },
    orderBy: [
      { date: 'asc' },
      { sentiment: 'asc' },
    ],
  });

  const analysis = {
    distribution: sentimentData,
    trend: sentimentTrend,
    dateRange: {
      start: start.toISOString(),
      end: end.toISOString(),
    },
  };

  return sendSuccess(res, analysis, 'Sentiment analysis retrieved successfully');
});

export const getMediaChannelAnalysis = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { companyId, startDate, endDate } = req.query;

  // Default date range (current month)
  const start = startDate ? new Date(startDate as string) : startOfMonth(new Date());
  const end = endDate ? new Date(endDate as string) : endOfMonth(new Date());

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

  // Get data entries by media channel
  const channelData = await prisma.dataEntry.groupBy({
    by: ['channelId'],
    where,
    _count: {
      channelId: true,
    },
    _sum: {
      value: true,
    },
    _avg: {
      value: true,
    },
  });

  // Get channel names
  const channelIds = channelData.map(cd => cd.channelId);
  const channels = await prisma.mediaChannel.findMany({
    where: { id: { in: channelIds } },
    select: { id: true, name: true, type: true, category: true },
  });

  const channelAnalysis = channelData.map(cd => ({
    ...cd,
    channel: channels.find(c => c.id === cd.channelId),
  }));

  return sendSuccess(res, channelAnalysis, 'Media channel analysis retrieved successfully');
});

export const getCompanyComparison = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { companyIds, startDate, endDate } = req.query;

  if (!companyIds) {
    return sendError(res, 'Company IDs are required', 400);
  }

  const ids = (companyIds as string).split(',');

  // Default date range (current month)
  const start = startDate ? new Date(startDate as string) : startOfMonth(new Date());
  const end = endDate ? new Date(endDate as string) : endOfMonth(new Date());

  // Build where clause
  const where: any = {
    date: {
      gte: start,
      lte: end,
    },
    companyId: {
      in: ids,
    },
  };

  // Role-based filtering
  if (req.user!.role === 'ANALYST') {
    where.analystId = req.user!.id;
  }

  // Get comparison data
  const comparisonData = await prisma.editorial.groupBy({
    by: ['companyId', 'sentiment'],
    where,
    _count: {
      sentiment: true,
    },
    _avg: {
      mediaSentimentIndex: true,
      audienceReach: true,
    },
    _sum: {
      audienceReach: true,
    },
  });

  // Get company names
  const companies = await prisma.company.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true, industry: true },
  });

  const comparison = comparisonData.map(cd => ({
    ...cd,
    company: companies.find(c => c.id === cd.companyId),
  }));

  return sendSuccess(res, comparison, 'Company comparison retrieved successfully');
});
