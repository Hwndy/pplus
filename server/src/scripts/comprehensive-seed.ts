/**
 * Comprehensive Database Seeding Script
 * Creates realistic data for all dashboard pages with proper relationships
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Nigerian companies data
const companiesData = [
  {
    name: 'Dangote Group',
    industry: 'Conglomerate',
    email: 'info@dangote.com',
    phone: '+234-1-448-0815',
    address: '1 Alfred Rewane Road, Ikoyi, Lagos',
    ceo: 'Aliko Dangote',
    website: 'https://www.dangote.com',
    description: 'Africa\'s leading industrial conglomerate'
  },
  {
    name: 'MTN Nigeria',
    industry: 'Telecommunications',
    email: 'info@mtn.ng',
    phone: '+234-803-000-0123',
    address: 'Churchgate Tower, 30 Afribank Street, Victoria Island, Lagos',
    ceo: 'Karl Toriola',
    website: 'https://www.mtn.ng',
    description: 'Leading telecommunications company in Nigeria'
  },
  {
    name: 'Guaranty Trust Bank',
    industry: 'Banking',
    email: 'info@gtbank.com',
    phone: '+234-1-448-5500',
    address: '635 Akin Adesola Street, Victoria Island, Lagos',
    ceo: 'Segun Agbaje',
    website: 'https://www.gtbank.com',
    description: 'Leading commercial bank in Nigeria'
  },
  {
    name: 'Nigerian Breweries',
    industry: 'Beverages',
    email: 'info@nbplc.com',
    phone: '+234-1-271-6400',
    address: 'Iganmu, Lagos',
    ceo: 'Hans Essaadi',
    website: 'https://www.nbplc.com',
    description: 'Leading brewery and beverage company'
  },
  {
    name: 'Shoprite Holdings',
    industry: 'Retail',
    email: 'info@shoprite.ng',
    phone: '+234-1-234-5678',
    address: 'Ikeja City Mall, Lagos',
    ceo: 'Pieter Engelbrecht',
    website: 'https://www.shoprite.ng',
    description: 'Leading retail chain in Nigeria'
  },
  {
    name: 'Zenith Bank',
    industry: 'Banking',
    email: 'info@zenithbank.com',
    phone: '+234-1-278-7000',
    address: '84 Ajose Adeogun Street, Victoria Island, Lagos',
    ceo: 'Ebenezer Onyeagwu',
    website: 'https://www.zenithbank.com',
    description: 'Leading commercial bank'
  },
  {
    name: 'First Bank of Nigeria',
    industry: 'Banking',
    email: 'info@firstbanknigeria.com',
    phone: '+234-1-448-2200',
    address: 'Samuel Asabia House, 35 Marina, Lagos',
    ceo: 'Adesola Adeduntan',
    website: 'https://www.firstbanknigeria.com',
    description: 'Nigeria\'s oldest commercial bank'
  },
  {
    name: 'Nestle Nigeria',
    industry: 'Food & Beverages',
    email: 'info@ng.nestle.com',
    phone: '+234-1-280-6000',
    address: '22-24 Industrial Avenue, Ilupeju, Lagos',
    ceo: 'Wassim Elhusseini',
    website: 'https://www.nestle-cwa.com',
    description: 'Leading food and beverage company'
  },
  {
    name: 'Unilever Nigeria',
    industry: 'Consumer Goods',
    email: 'info@unilever.com.ng',
    phone: '+234-1-280-8000',
    address: '1 Billings Way, Oregun, Lagos',
    ceo: 'Carl Cruz',
    website: 'https://www.unilever.com.ng',
    description: 'Leading consumer goods company'
  },
  {
    name: 'Access Bank',
    industry: 'Banking',
    email: 'info@accessbankplc.com',
    phone: '+234-1-271-2005',
    address: '999C Danmole Street, Victoria Island, Lagos',
    ceo: 'Herbert Wigwe',
    website: 'https://www.accessbankplc.com',
    description: 'Leading commercial bank'
  }
];

// Publications data
const publicationsData = [
  { name: 'The Guardian Nigeria', type: 'PRINT', website: 'https://guardian.ng', circulation: 50000 },
  { name: 'Punch Newspapers', type: 'PRINT', website: 'https://punchng.com', circulation: 80000 },
  { name: 'ThisDay Live', type: 'ONLINE', website: 'https://thisdaylive.com', circulation: 100000 },
  { name: 'Vanguard News', type: 'PRINT', website: 'https://vanguardngr.com', circulation: 60000 },
  { name: 'Premium Times', type: 'ONLINE', website: 'https://premiumtimesng.com', circulation: 120000 },
  { name: 'Daily Trust', type: 'PRINT', website: 'https://dailytrust.com', circulation: 70000 },
  { name: 'The Nation', type: 'PRINT', website: 'https://thenationonlineng.net', circulation: 55000 },
  { name: 'Leadership Newspaper', type: 'PRINT', website: 'https://leadership.ng', circulation: 45000 },
  { name: 'Sahara Reporters', type: 'ONLINE', website: 'https://saharareporters.com', circulation: 200000 },
  { name: 'Channels TV', type: 'ONLINE', website: 'https://channelstv.com', circulation: 150000 }
];

// Media channels data
const mediaChannelsData = [
  { name: 'Television', type: 'TELEVISION', category: 'Broadcast TV' },
  { name: 'Radio', type: 'RADIO', category: 'Radio Broadcasting' },
  { name: 'Newspapers', type: 'PRINT', category: 'Print Media' },
  { name: 'Online News', type: 'ONLINE', category: 'Digital Media' },
  { name: 'Social Media', type: 'SOCIAL_MEDIA', category: 'Social Platforms' },
  { name: 'Magazines', type: 'PRINT', category: 'Periodicals' },
  { name: 'Blogs', type: 'ONLINE', category: 'Digital Media' },
  { name: 'Podcasts', type: 'RADIO', category: 'Audio Content' },
  { name: 'YouTube', type: 'ONLINE', category: 'Video Content' },
  { name: 'Instagram', type: 'SOCIAL_MEDIA', category: 'Social Media' }
];

// Data parameters
const dataParametersData = [
  { name: 'Revenue Growth', category: 'Financial', description: 'Year-over-year revenue growth percentage', unit: '%' },
  { name: 'Market Share', category: 'Market', description: 'Company market share percentage', unit: '%' },
  { name: 'Customer Satisfaction', category: 'Customer', description: 'Customer satisfaction score', unit: 'Score' },
  { name: 'Brand Awareness', category: 'Marketing', description: 'Brand awareness percentage', unit: '%' },
  { name: 'Employee Count', category: 'HR', description: 'Total number of employees', unit: 'Count' },
  { name: 'Profit Margin', category: 'Financial', description: 'Net profit margin percentage', unit: '%' },
  { name: 'Social Media Followers', category: 'Marketing', description: 'Total social media followers', unit: 'Count' },
  { name: 'ESG Score', category: 'Sustainability', description: 'Environmental, Social, Governance score', unit: 'Score' },
  { name: 'Stock Price', category: 'Financial', description: 'Current stock price', unit: 'NGN' },
  { name: 'Market Capitalization', category: 'Financial', description: 'Total market value', unit: 'NGN Billion' }
];

// Users data with different roles
const usersData = [
  {
    name: 'John Analyst',
    email: 'analyst1@mediamonitor.com',
    password: 'analyst123',
    role: 'ANALYST',
    mobileContact: '+234-801-234-5678',
    countryCode: '+234'
  },
  {
    name: 'Jane Analyst',
    email: 'analyst2@mediamonitor.com',
    password: 'analyst123',
    role: 'ANALYST',
    mobileContact: '+234-802-345-6789',
    countryCode: '+234'
  },
  {
    name: 'Mike Supervisor',
    email: 'supervisor1@mediamonitor.com',
    password: 'supervisor123',
    role: 'SUPERVISOR',
    mobileContact: '+234-803-456-7890',
    countryCode: '+234'
  },
  {
    name: 'Sarah Supervisor',
    email: 'supervisor2@mediamonitor.com',
    password: 'supervisor123',
    role: 'SUPERVISOR',
    mobileContact: '+234-804-567-8901',
    countryCode: '+234'
  },
  {
    name: 'David Manager',
    email: 'manager@mediamonitor.com',
    password: 'manager123',
    role: 'ADMIN',
    mobileContact: '+234-805-678-9012',
    countryCode: '+234'
  },
  {
    name: 'Client User 1',
    email: 'client1@company.com',
    password: 'client123',
    role: 'CLIENT',
    mobileContact: '+234-806-789-0123',
    countryCode: '+234'
  },
  {
    name: 'Client User 2',
    email: 'client2@company.com',
    password: 'client123',
    role: 'CLIENT',
    mobileContact: '+234-807-890-1234',
    countryCode: '+234'
  },
  {
    name: 'Emma Analyst',
    email: 'analyst3@mediamonitor.com',
    password: 'analyst123',
    role: 'ANALYST',
    mobileContact: '+234-808-901-2345',
    countryCode: '+234'
  },
  {
    name: 'Tom Supervisor',
    email: 'supervisor3@mediamonitor.com',
    password: 'supervisor123',
    role: 'SUPERVISOR',
    mobileContact: '+234-809-012-3456',
    countryCode: '+234'
  },
  {
    name: 'Lisa Admin',
    email: 'admin2@mediamonitor.com',
    password: 'admin123',
    role: 'ADMIN',
    mobileContact: '+234-810-123-4567',
    countryCode: '+234'
  }
];

async function clearExistingData() {
  console.log('🧹 Clearing existing data...');
  
  // Clear in reverse dependency order
  await prisma.auditLog.deleteMany();
  await prisma.dailyMentionHighlight.deleteMany();
  await prisma.dailyMention.deleteMany();
  await prisma.swotItem.deleteMany();
  await prisma.swotAnalysis.deleteMany();
  await prisma.editorial.deleteMany();
  await prisma.dataEntry.deleteMany();
  await prisma.dataParameter.deleteMany();
  await prisma.mediaChannel.deleteMany();
  await prisma.publication.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany({ where: { email: { not: 'admin@mediamonitor.com' } } });
  
  console.log('✅ Existing data cleared');
}

async function seedUsers() {
  console.log('👥 Seeding users...');
  
  const createdUsers = [];
  for (const userData of usersData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword
      }
    });
    createdUsers.push(user);
    console.log(`✅ Created user: ${user.name} (${user.role})`);
  }
  
  return createdUsers;
}

async function seedCompanies(adminUserId: string) {
  console.log('🏢 Seeding companies...');

  const createdCompanies = [];
  for (const companyData of companiesData) {
    const company = await prisma.company.create({
      data: {
        ...companyData,
        isActive: true,
        createdById: adminUserId
      }
    });
    createdCompanies.push(company);
    console.log(`✅ Created company: ${company.name}`);
  }

  return createdCompanies;
}

async function seedPublications(adminUserId: string) {
  console.log('📰 Seeding publications...');

  const createdPublications = [];
  for (const pubData of publicationsData) {
    const publication = await prisma.publication.create({
      data: {
        ...pubData,
        isActive: true,
        createdById: adminUserId
      }
    });
    createdPublications.push(publication);
    console.log(`✅ Created publication: ${publication.name}`);
  }

  return createdPublications;
}

async function seedMediaChannels() {
  console.log('📺 Seeding media channels...');

  const createdChannels = [];
  for (const channelData of mediaChannelsData) {
    const channel = await prisma.mediaChannel.create({
      data: {
        ...channelData,
        isActive: true
      }
    });
    createdChannels.push(channel);
    console.log(`✅ Created media channel: ${channel.name}`);
  }

  return createdChannels;
}

async function seedDataParameters() {
  console.log('📊 Seeding data parameters...');

  const createdParameters = [];
  for (const paramData of dataParametersData) {
    const parameter = await prisma.dataParameter.create({
      data: {
        ...paramData,
        isActive: true
      }
    });
    createdParameters.push(parameter);
    console.log(`✅ Created data parameter: ${parameter.name}`);
  }

  return createdParameters;
}

async function seedDataEntries(companies: any[], parameters: any[], channels: any[], analysts: any[]) {
  console.log('📝 Seeding data entries...');

  const createdEntries = [];
  const statuses = ['PENDING', 'APPROVED', 'REJECTED', 'DRAFT'];

  // Create 20 data entries with realistic data
  for (let i = 0; i < 20; i++) {
    const company = companies[Math.floor(Math.random() * companies.length)];
    const parameter = parameters[Math.floor(Math.random() * parameters.length)];
    const channel = channels[Math.floor(Math.random() * channels.length)];
    const analyst = analysts[Math.floor(Math.random() * analysts.length)];

    // Generate realistic values based on parameter type
    let value = 0;
    switch (parameter.category) {
      case 'Financial':
        value = Math.random() * 100; // 0-100%
        break;
      case 'Market':
        value = Math.random() * 50; // 0-50%
        break;
      case 'Customer':
        value = 60 + Math.random() * 40; // 60-100 score
        break;
      case 'Marketing':
        value = Math.random() * 1000000; // 0-1M followers
        break;
      case 'HR':
        value = 100 + Math.random() * 10000; // 100-10,100 employees
        break;
      default:
        value = Math.random() * 100;
    }

    const entry = await prisma.dataEntry.create({
      data: {
        companyId: company.id,
        parameterId: parameter.id,
        channelId: channel.id,
        value: parseFloat(value.toFixed(2)),
        date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Last 90 days
        analystId: analyst.id,
        status: statuses[Math.floor(Math.random() * statuses.length)] as any,
        comments: `Analysis for ${company.name} - ${parameter.name}`,
        metadata: {
          source: channel.name,
          confidence: Math.random() * 100,
          methodology: 'Statistical analysis'
        }
      }
    });
    createdEntries.push(entry);
  }

  console.log(`✅ Created ${createdEntries.length} data entries`);
  return createdEntries;
}

async function seedEditorials(companies: any[], publications: any[], analysts: any[]) {
  console.log('📰 Seeding editorials...');

  const createdEditorials = [];
  const sentiments = ['POSITIVE', 'NEGATIVE', 'NEUTRAL'];
  const mediaTypes = ['PRINT', 'ONLINE', 'TELEVISION', 'RADIO'];
  const statuses = ['PENDING', 'APPROVED', 'REJECTED', 'DRAFT'];

  const editorialTitles = [
    'Company Reports Strong Q3 Results',
    'New Product Launch Drives Growth',
    'Market Expansion Strategy Announced',
    'Sustainability Initiative Launched',
    'Digital Transformation Progress',
    'Partnership Agreement Signed',
    'Investment in Technology Infrastructure',
    'Customer Service Excellence Award',
    'Financial Performance Review',
    'Strategic Business Update',
    'Innovation in Product Development',
    'Market Leadership Position',
    'Corporate Social Responsibility',
    'Operational Efficiency Improvements',
    'Stakeholder Value Creation'
  ];

  // Create 15 editorials
  for (let i = 0; i < 15; i++) {
    const company = companies[Math.floor(Math.random() * companies.length)];
    const publication = publications[Math.floor(Math.random() * publications.length)];
    const analyst = analysts[Math.floor(Math.random() * analysts.length)];
    const title = editorialTitles[i] || `Editorial about ${company.name}`;

    const editorial = await prisma.editorial.create({
      data: {
        date: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000), // Last 60 days
        companyId: company.id,
        industry: company.industry,
        brand: company.name,
        subSector: company.industry,
        publicationId: publication.id,
        placement: 'Front Page',
        title: title,
        page: `Page ${Math.floor(Math.random() * 20) + 1}`,
        link: `https://${publication.website}/article-${i + 1}`,
        reporter: `Reporter ${i + 1}`,
        country: 'Nigeria',
        language: 'English',
        spokesperson: `${company.name} Spokesperson`,
        activity: 'Business Update',
        mediaType: mediaTypes[Math.floor(Math.random() * mediaTypes.length)] as any,
        onlineChannel: publication.website,
        sentiment: sentiments[Math.floor(Math.random() * sentiments.length)] as any,
        mediaSentimentIndex: Math.random() * 100,
        advertSpend: Math.random() * 1000000,
        circulation: publication.circulation,
        audienceReach: Math.floor(Math.random() * 500000),
        pageSize: 'Full Page',
        analystNote: `Analysis of ${company.name} coverage in ${publication.name}`,
        status: statuses[Math.floor(Math.random() * statuses.length)] as any,
        analystId: analyst.id
      }
    });
    createdEditorials.push(editorial);
  }

  console.log(`✅ Created ${createdEditorials.length} editorials`);
  return createdEditorials;
}

async function seedSwotAnalyses(companies: any[], analysts: any[]) {
  console.log('🎯 Seeding SWOT analyses...');

  const createdAnalyses = [];
  const statuses = ['PENDING', 'APPROVED', 'REJECTED', 'DRAFT'];

  const swotItems = {
    STRENGTH: [
      'Strong brand recognition',
      'Market leadership position',
      'Robust financial performance',
      'Experienced management team',
      'Innovative product portfolio',
      'Strong customer loyalty',
      'Efficient operations',
      'Strategic partnerships'
    ],
    WEAKNESS: [
      'Limited geographic presence',
      'High operational costs',
      'Dependence on key customers',
      'Aging infrastructure',
      'Limited digital presence',
      'Regulatory compliance challenges',
      'Skills gap in workforce',
      'Supply chain vulnerabilities'
    ],
    OPPORTUNITY: [
      'Emerging market expansion',
      'Digital transformation',
      'New product development',
      'Strategic acquisitions',
      'Government policy support',
      'Growing consumer demand',
      'Technology adoption',
      'Sustainability initiatives'
    ],
    THREAT: [
      'Intense competition',
      'Economic uncertainty',
      'Regulatory changes',
      'Currency fluctuation',
      'Cybersecurity risks',
      'Supply chain disruption',
      'Changing consumer preferences',
      'Political instability'
    ]
  };

  // Create 10 SWOT analyses
  for (let i = 0; i < 10; i++) {
    const company = companies[Math.floor(Math.random() * companies.length)];
    const analyst = analysts[Math.floor(Math.random() * analysts.length)];

    const swotAnalysis = await prisma.swotAnalysis.create({
      data: {
        companyId: company.id,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Last 30 days
        analystNote: `SWOT analysis for ${company.name} conducted by ${analyst.name}`,
        status: statuses[Math.floor(Math.random() * statuses.length)] as any,
        analystId: analyst.id
      }
    });

    // Add SWOT items
    for (const [type, items] of Object.entries(swotItems)) {
      const selectedItems = items.sort(() => 0.5 - Math.random()).slice(0, 2); // 2 items per category
      for (const item of selectedItems) {
        await prisma.swotItem.create({
          data: {
            content: item,
            type: type,
            swotAnalysisId: swotAnalysis.id
          }
        });
      }
    }

    createdAnalyses.push(swotAnalysis);
  }

  console.log(`✅ Created ${createdAnalyses.length} SWOT analyses`);
  return createdAnalyses;
}

async function seedDailyMentions(companies: any[], analysts: any[]) {
  console.log('📅 Seeding daily mentions...');

  const createdMentions = [];
  const statuses = ['PENDING', 'APPROVED', 'REJECTED', 'DRAFT'];
  const sentiments = ['POSITIVE', 'NEGATIVE', 'NEUTRAL'];

  const mentionTitles = [
    'Daily Market Update',
    'Industry News Roundup',
    'Company Performance Highlights',
    'Market Trends Analysis',
    'Business Development News',
    'Financial Results Summary',
    'Strategic Announcements',
    'Product Launch Coverage',
    'Partnership News',
    'Investment Updates'
  ];

  const highlights = [
    'Strong quarterly performance reported',
    'New market expansion announced',
    'Strategic partnership established',
    'Innovation in product development',
    'Sustainability initiative launched',
    'Digital transformation progress',
    'Customer satisfaction improvement',
    'Market share growth achieved',
    'Operational efficiency gains',
    'Investment in technology infrastructure'
  ];

  // Create 12 daily mentions
  for (let i = 0; i < 12; i++) {
    const company = companies[Math.floor(Math.random() * companies.length)];
    const analyst = analysts[Math.floor(Math.random() * analysts.length)];

    const dailyMention = await prisma.dailyMention.create({
      data: {
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Last 30 days
        companyId: company.id,
        title: `${mentionTitles[i % mentionTitles.length]} - ${company.name}`,
        publications: [
          'The Guardian Nigeria',
          'Punch Newspapers',
          'ThisDay Live',
          'Vanguard News'
        ].sort(() => 0.5 - Math.random()).slice(0, 2), // Random 2 publications
        analystNote: `Daily mention analysis for ${company.name}`,
        status: statuses[Math.floor(Math.random() * statuses.length)] as any,
        analystId: analyst.id
      }
    });

    // Add highlights
    const selectedHighlights = highlights.sort(() => 0.5 - Math.random()).slice(0, 3); // 3 highlights per mention
    for (const highlight of selectedHighlights) {
      await prisma.dailyMentionHighlight.create({
        data: {
          content: highlight,
          type: sentiments[Math.floor(Math.random() * sentiments.length)] as any,
          dailyMentionId: dailyMention.id
        }
      });
    }

    createdMentions.push(dailyMention);
  }

  console.log(`✅ Created ${createdMentions.length} daily mentions`);
  return createdMentions;
}

async function seedAuditLogs(users: any[]) {
  console.log('📋 Seeding audit logs...');

  const actions = [
    'CREATE_COMPANY',
    'UPDATE_COMPANY',
    'DELETE_COMPANY',
    'CREATE_USER',
    'UPDATE_USER',
    'LOGIN',
    'LOGOUT',
    'CREATE_EDITORIAL',
    'UPDATE_EDITORIAL',
    'APPROVE_CONTENT',
    'REJECT_CONTENT'
  ];

  const resources = ['Company', 'User', 'Editorial', 'DataEntry', 'SwotAnalysis', 'DailyMention'];

  // Create 25 audit logs
  for (let i = 0; i < 25; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const resource = resources[Math.floor(Math.random() * resources.length)];

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: action,
        resource: resource,
        resourceId: `resource_${i + 1}`,
        details: {
          action: action,
          resource: resource,
          timestamp: new Date(),
          userRole: user.role
        },
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Last 7 days
      }
    });
  }

  console.log('✅ Created 25 audit logs');
}

async function comprehensiveSeed() {
  console.log('🌱 Starting comprehensive database seeding...\n');

  try {
    // Get admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@mediamonitor.com' }
    });

    if (!adminUser) {
      throw new Error('Admin user not found. Please ensure admin user exists before seeding.');
    }

    console.log(`✅ Admin user found: ${adminUser.email}\n`);

    // Clear existing data
    await clearExistingData();

    // Seed all data
    const users = await seedUsers();
    const companies = await seedCompanies(adminUser.id);
    const publications = await seedPublications(adminUser.id);
    const mediaChannels = await seedMediaChannels();
    const dataParameters = await seedDataParameters();

    // Get analysts for content creation
    const analysts = users.filter(user => user.role === 'ANALYST');

    // Seed content data
    await seedDataEntries(companies, dataParameters, mediaChannels, analysts);
    await seedEditorials(companies, publications, analysts);
    await seedSwotAnalyses(companies, analysts);
    await seedDailyMentions(companies, analysts);
    await seedAuditLogs([...users, adminUser]);

    // Final summary
    const counts = {
      users: await prisma.user.count(),
      companies: await prisma.company.count(),
      publications: await prisma.publication.count(),
      mediaChannels: await prisma.mediaChannel.count(),
      dataParameters: await prisma.dataParameter.count(),
      dataEntries: await prisma.dataEntry.count(),
      editorials: await prisma.editorial.count(),
      swotAnalyses: await prisma.swotAnalysis.count(),
      dailyMentions: await prisma.dailyMention.count(),
      auditLogs: await prisma.auditLog.count()
    };

    console.log('\n🎉 Comprehensive seeding completed successfully!');
    console.log('📊 Database Summary:');
    console.log(`   👥 Users: ${counts.users}`);
    console.log(`   🏢 Companies: ${counts.companies}`);
    console.log(`   📰 Publications: ${counts.publications}`);
    console.log(`   📺 Media Channels: ${counts.mediaChannels}`);
    console.log(`   📊 Data Parameters: ${counts.dataParameters}`);
    console.log(`   📝 Data Entries: ${counts.dataEntries}`);
    console.log(`   📰 Editorials: ${counts.editorials}`);
    console.log(`   🎯 SWOT Analyses: ${counts.swotAnalyses}`);
    console.log(`   📅 Daily Mentions: ${counts.dailyMentions}`);
    console.log(`   📋 Audit Logs: ${counts.auditLogs}`);

  } catch (error) {
    console.error('❌ Error during comprehensive seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  comprehensiveSeed()
    .then(() => {
      console.log('\n🎉 Seeding process completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Seeding process failed:', error);
      process.exit(1);
    });
}

export {
  companiesData,
  publicationsData,
  mediaChannelsData,
  dataParametersData,
  usersData,
  clearExistingData,
  seedUsers,
  seedCompanies,
  seedPublications,
  seedMediaChannels,
  seedDataParameters,
  seedDataEntries,
  seedEditorials,
  seedSwotAnalyses,
  seedDailyMentions,
  seedAuditLogs,
  comprehensiveSeed
};
