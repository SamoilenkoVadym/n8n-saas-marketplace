import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Script to create an admin user
 * Usage: npx ts-node scripts/create-admin.ts
 */
async function createAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@aimpress.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin@123456';
  const name = process.env.ADMIN_NAME || 'Admin User';

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      // Update existing user to admin
      const updatedUser = await prisma.user.update({
        where: { email },
        data: { role: 'admin' },
      });

      console.log('✅ User updated to admin role:');
      console.log('   Email:', updatedUser.email);
      console.log('   Role:', updatedUser.role);
      return;
    }

    // Create new admin user
    const passwordHash = await bcrypt.hash(password, 10);

    const admin = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: 'admin',
        credits: 1000, // Give admin 1000 credits
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Password:', password);
    console.log('👤 Name:', admin.name);
    console.log('🎭 Role:', admin.role);
    console.log('💳 Credits:', admin.credits);
    console.log('');
    console.log('⚠️  Please change the password after first login!');
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin()
  .then(() => {
    console.log('✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
