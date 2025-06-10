/**
 * Script to seed the database with mock data from frontend components
 * This will populate the database with realistic test data for development
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Mock companies data from CompaniesPage.tsx
const mockCompanies = [
  {
    name: 'Brynn Stout',
    email: 'vory@mailinator.com',
    industry: 'Ab id voluptatem i',
    ceo: 'Blanditiis',
    phone: '+1 (379) 319-6619',
    address: 'Quam quis sunt et il consequat',
    isActive: true
  },
  {
    name: 'testcompany',
    email: 'testcompany5@mailinator.com',
    industry: 'Test',
    ceo: 'Peter smith',
    phone: '7678765678',
    address: 'Ring road 67 wilson gate',
    isActive: true
  },
  {
    name: 'Toggle test comp',
    email: 'toggletest@mailinator.com',
    industry: 'IT',
    ceo: 'Incididunt reprehend',
    phone: '+1 (271) 808-8898',
    address: 'Ea esse temporibus',
    isActive: true
  },
  {
    name: 'Alden Farley',
    email: 'dinyje@mailinator.com',
    industry: 'Similique debitis se',
    ceo: 'A qui ut a sed eorum',
    phone: '+1 (159) 531-9222',
    address: 'Veniam maiores volu',
    isActive: true
  },
  {
    name: 'Jada Booth',
    email: 'tahwyp@mailinator.com',
    industry: 'Eaque esse voluptas',
    ceo: 'Nam ad molestiae inc',
    phone: '+1 (685) 628-4304',
    address: 'Sed blanditiis facer',
    isActive: true
  },
  {
    name: 'Bree Stark',
    email: 'pabumazos@mailinator.com',
    industry: 'Autem velit minim qu',
    ceo: 'Soluta enim dicta pa',
    phone: '+1 (528) 796-4895',
    address: 'Ullam quod deleniti',
    isActive: true
  },
  {
    name: 'AXA Mansard Insurance',
    email: 'CustomerCareNigeria@axamansard.com',
    industry: 'Financial Services',
    ceo: 'Kunle Ahmed',
    phone: '07090909909909',
    address: 'Lagos',
    isActive: true
  },
  {
    name: 'FCMB',
    email: 'CustomerCareNigeria@fcmb.com',
    industry: 'Financial Services',
    ceo: 'Yemisi Edun',
    phone: '07090909909909',
    address: 'Lagos',
    isActive: true
  },
  {
    name: 'Stanbic IBTC Bank',
    email: 'CustomerCareNigeria@stanbicibtc.com',
    industry: 'Financial Services',
    ceo: 'Demola Sogunle',
    phone: '0700 909 909 909',
    address: 'Lagos',
    isActive: true
  },
  {
    name: 'FIDELITY',
    email: 'pyxolyvas@mailinator.com',
    industry: 'Est vitae quaerat ac',
    ceo: 'Rem a quaerat a perf',
    phone: '+1 (927) 651-2333',
    address: 'Tenetur ea quia pari',
    isActive: true
  }
];

// Mock publications data
const mockPublications = [
  { name: 'The Guardian Nigeria', type: 'PRINT', country: 'Nigeria', isActive: true },
  { name: 'Punch Newspapers', type: 'PRINT', country: 'Nigeria', isActive: true },
  { name: 'ThisDay Live', type: 'ONLINE', country: 'Nigeria', isActive: true },
  { name: 'Vanguard News', type: 'PRINT', country: 'Nigeria', isActive: true },
  { name: 'Premium Times', type: 'ONLINE', country: 'Nigeria', isActive: true },
  { name: 'Daily Trust', type: 'PRINT', country: 'Nigeria', isActive: true },
  { name: 'The Nation', type: 'PRINT', country: 'Nigeria', isActive: true },
  { name: 'Leadership Newspaper', type: 'PRINT', country: 'Nigeria', isActive: true },
  { name: 'Sahara Reporters', type: 'ONLINE', country: 'Nigeria', isActive: true },
  { name: 'Channels TV', type: 'BROADCAST', country: 'Nigeria', isActive: true }
];

// Mock media channels data
const mockMediaChannels = [
  { name: 'Television', type: 'BROADCAST', category: 'TV', isActive: true },
  { name: 'Radio', type: 'BROADCAST', category: 'Radio', isActive: true },
  { name: 'Newspapers', type: 'PRINT', category: 'Print Media', isActive: true },
  { name: 'Online News', type: 'ONLINE', category: 'Digital Media', isActive: true },
  { name: 'Social Media', type: 'ONLINE', category: 'Social Platforms', isActive: true },
  { name: 'Magazines', type: 'PRINT', category: 'Periodicals', isActive: true },
  { name: 'Blogs', type: 'ONLINE', category: 'Digital Media', isActive: true },
  { name: 'Podcasts', type: 'BROADCAST', category: 'Audio', isActive: true }
];

// Mock data parameters
const mockDataParameters = [
  { name: 'Revenue Growth', category: 'Financial', description: 'Year-over-year revenue growth percentage', isActive: true },
  { name: 'Market Share', category: 'Market', description: 'Company market share percentage', isActive: true },
  { name: 'Customer Satisfaction', category: 'Customer', description: 'Customer satisfaction score', isActive: true },
  { name: 'Brand Awareness', category: 'Marketing', description: 'Brand awareness percentage', isActive: true },
  { name: 'Employee Count', category: 'HR', description: 'Total number of employees', isActive: true },
  { name: 'Profit Margin', category: 'Financial', description: 'Net profit margin percentage', isActive: true },
  { name: 'Social Media Followers', category: 'Marketing', description: 'Total social media followers', isActive: true },
  { name: 'ESG Score', category: 'Sustainability', description: 'Environmental, Social, Governance score', isActive: true }
];

// Mock users data
const mockUsers = [
  {
    name: 'John Analyst',
    email: 'analyst@mediamonitor.com',
    password: 'analyst123',
    role: 'ANALYST',
    mobileContact: '+234-801-234-5678',
    countryCode: '+234',
    isActive: true
  },
  {
    name: 'Jane Supervisor',
    email: 'supervisor@mediamonitor.com',
    password: 'supervisor123',
    role: 'SUPERVISOR',
    mobileContact: '+234-802-345-6789',
    countryCode: '+234',
    isActive: true
  },
  {
    name: 'Mike Manager',
    email: 'manager@mediamonitor.com',
    password: 'manager123',
    role: 'MANAGER',
    mobileContact: '+234-803-456-7890',
    countryCode: '+234',
    isActive: true
  }
];

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🧹 Clearing existing data...');
    await prisma.auditLog.deleteMany();
    await prisma.dataEntry.deleteMany();
    await prisma.editorial.deleteMany();
    await prisma.swotAnalysis.deleteMany();
    await prisma.dailyMention.deleteMany();
    await prisma.dataParameter.deleteMany();
    await prisma.mediaChannel.deleteMany();
    await prisma.publication.deleteMany();
    await prisma.company.deleteMany();
    await prisma.user.deleteMany({ where: { email: { not: 'admin@mediamonitor.com' } } });

    // Get admin user for createdBy relationships
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@mediamonitor.com' }
    });

    if (!adminUser) {
      throw new Error('Admin user not found. Please ensure admin user exists before seeding.');
    }

    // Seed companies
    console.log('🏢 Seeding companies...');
    for (const company of mockCompanies) {
      await prisma.company.create({
        data: {
          ...company,
          createdById: adminUser.id
        }
      });
    }

    // Seed publications
    console.log('📰 Seeding publications...');
    for (const publication of mockPublications) {
      await prisma.publication.create({
        data: {
          ...publication,
          createdById: adminUser.id
        }
      });
    }

    // Seed media channels
    console.log('📺 Seeding media channels...');
    for (const channel of mockMediaChannels) {
      await prisma.mediaChannel.create({
        data: channel
      });
    }

    // Seed data parameters
    console.log('📊 Seeding data parameters...');
    for (const parameter of mockDataParameters) {
      await prisma.dataParameter.create({
        data: parameter
      });
    }

    // Seed users
    console.log('👥 Seeding users...');
    for (const user of mockUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await prisma.user.create({
        data: {
          ...user,
          password: hashedPassword
        }
      });
    }

    // Create some sample data entries and editorials
    console.log('📝 Creating sample data entries and editorials...');
    
    const companies = await prisma.company.findMany({ take: 3 });
    const publications = await prisma.publication.findMany({ take: 3 });
    const channels = await prisma.mediaChannel.findMany({ take: 3 });
    const parameters = await prisma.dataParameter.findMany({ take: 3 });
    const users = await prisma.user.findMany({ where: { role: 'ANALYST' }, take: 1 });

    if (companies.length > 0 && users.length > 0) {
      // Create sample data entries
      for (let i = 0; i < 5; i++) {
        await prisma.dataEntry.create({
          data: {
            companyId: companies[i % companies.length].id,
            parameterId: parameters[i % parameters.length].id,
            channelId: channels[i % channels.length].id,
            value: Math.random() * 100,
            date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            analystId: users[0].id,
            status: ['DRAFT', 'PENDING', 'APPROVED'][Math.floor(Math.random() * 3)] as any,
            notes: `Sample data entry ${i + 1}`
          }
        });
      }

      // Create sample editorials
      for (let i = 0; i < 5; i++) {
        await prisma.editorial.create({
          data: {
            companyId: companies[i % companies.length].id,
            publicationId: publications[i % publications.length].id,
            title: `Sample Editorial ${i + 1}`,
            industry: companies[i % companies.length].industry,
            brand: companies[i % companies.length].name,
            mediaType: ['PRINT', 'ONLINE', 'BROADCAST'][Math.floor(Math.random() * 3)] as any,
            sentiment: ['POSITIVE', 'NEGATIVE', 'NEUTRAL'][Math.floor(Math.random() * 3)] as any,
            date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            analystId: users[0].id,
            status: ['DRAFT', 'PENDING', 'APPROVED'][Math.floor(Math.random() * 3)] as any,
            link: `https://example.com/editorial-${i + 1}`
          }
        });
      }
    }

    console.log('✅ Database seeding completed successfully!');
    console.log(`📊 Seeded:`);
    console.log(`   - ${mockCompanies.length} companies`);
    console.log(`   - ${mockPublications.length} publications`);
    console.log(`   - ${mockMediaChannels.length} media channels`);
    console.log(`   - ${mockDataParameters.length} data parameters`);
    console.log(`   - ${mockUsers.length} users`);
    console.log(`   - 5 sample data entries`);
    console.log(`   - 5 sample editorials`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('🎉 Seeding process completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding process failed:', error);
      process.exit(1);
    });
}

export { seedDatabase };
