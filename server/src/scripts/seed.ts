import { PrismaClient, UserRole, MediaType, SentimentType, PublicationType } from '@prisma/client';
import { hashPassword } from '../utils/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@mediamonitor.com' },
    update: {},
    create: {
      email: 'admin@mediamonitor.com',
      name: 'Admin User',
      password: await hashPassword('admin123'),
      role: UserRole.ADMIN,
      status: 'ACTIVE',
    },
  });

  // Create supervisor user
  const supervisorUser = await prisma.user.upsert({
    where: { email: 'supervisor@mediamonitor.com' },
    update: {},
    create: {
      email: 'supervisor@mediamonitor.com',
      name: 'Supervisor User',
      password: await hashPassword('supervisor123'),
      role: UserRole.SUPERVISOR,
      status: 'ACTIVE',
    },
  });

  // Create analyst user
  const analystUser = await prisma.user.upsert({
    where: { email: 'analyst@mediamonitor.com' },
    update: {},
    create: {
      email: 'analyst@mediamonitor.com',
      name: 'Analyst User',
      password: await hashPassword('analyst123'),
      role: UserRole.ANALYST,
      status: 'ACTIVE',
      supervisorId: supervisorUser.id,
    },
  });

  // Create client user
  const clientUser = await prisma.user.upsert({
    where: { email: 'client@mediamonitor.com' },
    update: {},
    create: {
      email: 'client@mediamonitor.com',
      name: 'Client User',
      password: await hashPassword('client123'),
      role: UserRole.CLIENT,
      status: 'ACTIVE',
    },
  });

  console.log('✅ Users created');

  // Create companies
  const companies = await Promise.all([
    prisma.company.upsert({
      where: { name: 'Stanbic IBTC Bank' },
      update: {},
      create: {
        name: 'Stanbic IBTC Bank',
        industry: 'Financial Services',
        website: 'https://www.stanbicibtc.com',
        description: 'Leading financial services provider in Nigeria',
        createdById: adminUser.id,
      },
    }),
    prisma.company.upsert({
      where: { name: 'MTN Nigeria' },
      update: {},
      create: {
        name: 'MTN Nigeria',
        industry: 'Telecommunications',
        website: 'https://www.mtnonline.com',
        description: 'Leading telecommunications company in Nigeria',
        createdById: adminUser.id,
      },
    }),
    prisma.company.upsert({
      where: { name: 'Dangote Group' },
      update: {},
      create: {
        name: 'Dangote Group',
        industry: 'Conglomerate',
        website: 'https://www.dangote.com',
        description: 'Largest industrial conglomerate in West Africa',
        createdById: adminUser.id,
      },
    }),
  ]);

  console.log('✅ Companies created');

  // Create publications
  const publications = await Promise.all([
    prisma.publication.upsert({
      where: { name: 'The Guardian Nigeria' },
      update: {},
      create: {
        name: 'The Guardian Nigeria',
        type: PublicationType.BOTH,
        website: 'https://guardian.ng',
        country: 'Nigeria',
        language: 'English',
        circulation: 50000,
        createdById: adminUser.id,
      },
    }),
    prisma.publication.upsert({
      where: { name: 'Punch Newspapers' },
      update: {},
      create: {
        name: 'Punch Newspapers',
        type: PublicationType.BOTH,
        website: 'https://punchng.com',
        country: 'Nigeria',
        language: 'English',
        circulation: 75000,
        createdById: adminUser.id,
      },
    }),
    prisma.publication.upsert({
      where: { name: 'BusinessDay' },
      update: {},
      create: {
        name: 'BusinessDay',
        type: PublicationType.BOTH,
        website: 'https://businessday.ng',
        country: 'Nigeria',
        language: 'English',
        circulation: 30000,
        createdById: adminUser.id,
      },
    }),
    prisma.publication.upsert({
      where: { name: 'Channels Television' },
      update: {},
      create: {
        name: 'Channels Television',
        type: PublicationType.ONLINE,
        website: 'https://www.channelstv.com',
        country: 'Nigeria',
        language: 'English',
        circulation: 0,
        createdById: adminUser.id,
      },
    }),
  ]);

  console.log('✅ Publications created');

  // Create media channels
  const mediaChannels = await Promise.all([
    prisma.mediaChannel.upsert({
      where: { name: 'Television' },
      update: {},
      create: {
        name: 'Television',
        type: MediaType.TELEVISION,
        category: 'Traditional',
        description: 'TV channels and programs',
      },
    }),
    prisma.mediaChannel.upsert({
      where: { name: 'Radio' },
      update: {},
      create: {
        name: 'Radio',
        type: MediaType.RADIO,
        category: 'Traditional',
        description: 'Radio stations and programs',
      },
    }),
    prisma.mediaChannel.upsert({
      where: { name: 'Newspapers' },
      update: {},
      create: {
        name: 'Newspapers',
        type: MediaType.PRINT,
        category: 'Traditional',
        description: 'Print newspapers',
      },
    }),
    prisma.mediaChannel.upsert({
      where: { name: 'Online News' },
      update: {},
      create: {
        name: 'Online News',
        type: MediaType.ONLINE,
        category: 'Digital',
        description: 'Online news websites',
      },
    }),
    prisma.mediaChannel.upsert({
      where: { name: 'Social Media' },
      update: {},
      create: {
        name: 'Social Media',
        type: MediaType.SOCIAL_MEDIA,
        category: 'Social',
        description: 'Social media platforms',
      },
    }),
  ]);

  console.log('✅ Media channels created');

  // Create data parameters
  const dataParameters = await Promise.all([
    prisma.dataParameter.upsert({
      where: { name: 'News Mentions' },
      update: {},
      create: {
        name: 'News Mentions',
        category: 'Mentions',
        description: 'Count of mentions in news articles',
        unit: 'count',
      },
    }),
    prisma.dataParameter.upsert({
      where: { name: 'Social Media Mentions' },
      update: {},
      create: {
        name: 'Social Media Mentions',
        category: 'Mentions',
        description: 'Count of mentions on social media',
        unit: 'count',
      },
    }),
    prisma.dataParameter.upsert({
      where: { name: 'Audience Reach' },
      update: {},
      create: {
        name: 'Audience Reach',
        category: 'Engagement',
        description: 'Potential audience reach',
        unit: 'people',
      },
    }),
    prisma.dataParameter.upsert({
      where: { name: 'Engagement Rate' },
      update: {},
      create: {
        name: 'Engagement Rate',
        category: 'Engagement',
        description: 'Interaction with content',
        unit: 'percentage',
      },
    }),
    prisma.dataParameter.upsert({
      where: { name: 'Sentiment Score' },
      update: {},
      create: {
        name: 'Sentiment Score',
        category: 'Analysis',
        description: 'Positive, negative, or neutral tone',
        unit: 'score',
      },
    }),
  ]);

  console.log('✅ Data parameters created');

  // Create sample data entries
  const sampleDataEntries = [];
  for (let i = 0; i < 50; i++) {
    const randomCompany = companies[Math.floor(Math.random() * companies.length)];
    const randomParameter = dataParameters[Math.floor(Math.random() * dataParameters.length)];
    const randomChannel = mediaChannels[Math.floor(Math.random() * mediaChannels.length)];
    const randomDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const randomValue = Math.floor(Math.random() * 1000) + 1;

    sampleDataEntries.push({
      companyId: randomCompany.id,
      parameterId: randomParameter.id,
      channelId: randomChannel.id,
      value: randomValue,
      date: randomDate,
      analystId: analystUser.id,
      status: ['PENDING', 'APPROVED', 'REJECTED'][Math.floor(Math.random() * 3)] as any,
      comments: Math.random() > 0.7 ? 'Sample comment for data entry' : null,
    });
  }

  await prisma.dataEntry.createMany({
    data: sampleDataEntries,
    skipDuplicates: true,
  });

  console.log('✅ Sample data entries created');

  // Create sample editorials
  const sampleEditorials = [];
  for (let i = 0; i < 30; i++) {
    const randomCompany = companies[Math.floor(Math.random() * companies.length)];
    const randomPublication = publications[Math.floor(Math.random() * publications.length)];
    const randomDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const sentiments = [SentimentType.POSITIVE, SentimentType.NEGATIVE, SentimentType.NEUTRAL];
    const mediaTypes = [MediaType.PRINT, MediaType.ONLINE, MediaType.TELEVISION];

    sampleEditorials.push({
      date: randomDate,
      companyId: randomCompany.id,
      industry: randomCompany.industry,
      brand: randomCompany.name,
      publicationId: randomPublication.id,
      title: `Sample editorial about ${randomCompany.name} - ${i + 1}`,
      mediaType: mediaTypes[Math.floor(Math.random() * mediaTypes.length)],
      sentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
      mediaSentimentIndex: Math.random() * 5,
      audienceReach: Math.floor(Math.random() * 100000) + 1000,
      circulation: Math.floor(Math.random() * 50000) + 1000,
      analystId: analystUser.id,
      status: ['PENDING', 'APPROVED', 'REJECTED'][Math.floor(Math.random() * 3)] as any,
    });
  }

  await prisma.editorial.createMany({
    data: sampleEditorials,
    skipDuplicates: true,
  });

  console.log('✅ Sample editorials created');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Default user accounts:');
  console.log('Admin: admin@mediamonitor.com / admin123');
  console.log('Supervisor: supervisor@mediamonitor.com / supervisor123');
  console.log('Analyst: analyst@mediamonitor.com / analyst123');
  console.log('Client: client@mediamonitor.com / client123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
