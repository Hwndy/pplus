import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/auth';

const prisma = new PrismaClient();

async function setupDatabase() {
  console.log('🔧 Setting up database...');

  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Check if admin user exists
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@mediamonitor.com' },
    });

    if (!adminUser) {
      console.log('👤 Creating default admin user...');
      await prisma.user.create({
        data: {
          email: 'admin@mediamonitor.com',
          name: 'Admin User',
          password: await hashPassword('admin123'),
          role: 'ADMIN',
          status: 'ACTIVE',
        },
      });
      console.log('✅ Admin user created');
    } else {
      console.log('👤 Admin user already exists');
    }

    // Check if any companies exist
    const companyCount = await prisma.company.count();
    if (companyCount === 0) {
      console.log('🏢 Creating sample company...');
      await prisma.company.create({
        data: {
          name: 'Sample Company',
          industry: 'Technology',
          website: 'https://example.com',
          description: 'A sample company for testing',
          createdById: adminUser?.id || (await prisma.user.findFirst({ where: { role: 'ADMIN' } }))?.id || '',
        },
      });
      console.log('✅ Sample company created');
    }

    console.log('🎉 Database setup completed successfully!');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('Setup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}

export { setupDatabase };
