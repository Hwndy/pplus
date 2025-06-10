import prisma from '../lib/prisma';

// Database utility functions

export const checkEntityExists = async (model: string, id: string): Promise<boolean> => {
  try {
    const entity = await (prisma as any)[model].findUnique({
      where: { id },
      select: { id: true },
    });
    return !!entity;
  } catch (error) {
    return false;
  }
};

export const checkUniqueField = async (
  model: string,
  field: string,
  value: string,
  excludeId?: string
): Promise<boolean> => {
  try {
    const where: any = { [field]: value };
    if (excludeId) {
      where.id = { not: excludeId };
    }

    const entity = await (prisma as any)[model].findFirst({
      where,
      select: { id: true },
    });
    return !entity; // Returns true if unique (no existing entity found)
  } catch (error) {
    return false;
  }
};

export const buildPaginationQuery = (page: number, limit: number) => {
  const skip = (page - 1) * limit;
  return {
    skip,
    take: limit,
  };
};

export const buildDateRangeFilter = (startDate?: string, endDate?: string) => {
  const filter: any = {};
  
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) {
      filter.date.gte = new Date(startDate);
    }
    if (endDate) {
      filter.date.lte = new Date(endDate);
    }
  }
  
  return filter;
};

export const buildSearchFilter = (searchTerm: string, fields: string[]) => {
  if (!searchTerm || fields.length === 0) {
    return {};
  }

  return {
    OR: fields.map(field => ({
      [field]: {
        contains: searchTerm,
        mode: 'insensitive' as const,
      },
    })),
  };
};

export const buildRoleBasedFilter = (userRole: string, userId: string) => {
  if (userRole === 'ANALYST') {
    return { analystId: userId };
  }
  return {};
};

export const formatPaginationResponse = (
  data: any[],
  total: number,
  page: number,
  limit: number
) => {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
};

// Transaction wrapper for complex operations
export const withTransaction = async <T>(
  callback: (tx: typeof prisma) => Promise<T>
): Promise<T> => {
  return prisma.$transaction(callback);
};

// Soft delete utility (if needed in the future)
export const softDelete = async (model: string, id: string) => {
  return (prisma as any)[model].update({
    where: { id },
    data: {
      deletedAt: new Date(),
      isActive: false,
    },
  });
};

// Bulk operations utility
export const bulkCreate = async (model: string, data: any[]) => {
  return (prisma as any)[model].createMany({
    data,
    skipDuplicates: true,
  });
};

export const bulkUpdate = async (model: string, updates: Array<{ id: string; data: any }>) => {
  const promises = updates.map(({ id, data }) =>
    (prisma as any)[model].update({
      where: { id },
      data,
    })
  );
  
  return Promise.all(promises);
};

// Analytics helper functions
export const getDateRangeStats = async (
  model: string,
  startDate: Date,
  endDate: Date,
  groupBy: string = 'date'
) => {
  return (prisma as any)[model].groupBy({
    by: [groupBy],
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    _count: {
      id: true,
    },
    orderBy: {
      [groupBy]: 'asc',
    },
  });
};

export const getSentimentDistribution = async (
  startDate: Date,
  endDate: Date,
  companyId?: string
) => {
  const where: any = {
    date: {
      gte: startDate,
      lte: endDate,
    },
  };

  if (companyId) {
    where.companyId = companyId;
  }

  return prisma.editorial.groupBy({
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
};

export const getTopCompanies = async (
  startDate: Date,
  endDate: Date,
  limit: number = 5
) => {
  const topCompanies = await prisma.editorial.groupBy({
    by: ['companyId'],
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    _count: {
      companyId: true,
    },
    orderBy: {
      _count: {
        companyId: 'desc',
      },
    },
    take: limit,
  });

  // Get company details
  const companyIds = topCompanies.map(tc => tc.companyId);
  const companies = await prisma.company.findMany({
    where: { id: { in: companyIds } },
    select: { id: true, name: true, industry: true },
  });

  return topCompanies.map(tc => ({
    ...tc,
    company: companies.find(c => c.id === tc.companyId),
  }));
};
