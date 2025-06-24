import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  try {
    const adminEmail = 'admin1@example.com';
    const password = 'admin123';

    // 🔍 Check if admin already exists
    const existing = await prisma.users.findUnique({
      where: { email: adminEmail },
    });

    if (existing) {
      console.log('✅ Admin user already exists.');
      return;
    }

    // 🔐 Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10); // 10 salt rounds

    // 📦 Create admin user in DB
    const admin = await prisma.users.create({
      data: {
        name: 'Admin User1',
        email: adminEmail,
        password: hashedPassword,
        userType: 'admin',
        // Optional: remove these if not in your model
        // firstName: 'Admin',
        // lastName: 'User',
      },
    });

    console.log('✅ Admin user created:', admin);
  } catch (e) {
    console.error('❌ Error in main():', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
