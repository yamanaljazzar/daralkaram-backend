import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Hash passwords
  const adminPassword = await bcrypt.hash('12341234', 12);
  // const supervisorPassword = await bcrypt.hash('supervisor123', 12);
  // const teacherPassword = await bcrypt.hash('teacher123', 12);
  // const guardianPassword = await bcrypt.hash('guardian123', 12);

  // Create sample users

  // const supervisor = await prisma.user.upsert({
  //   where: { email: 'supervisor@daralkaram.com' },
  //   update: {},
  //   create: {
  //     email: 'supervisor@daralkaram.com',
  //     passwordHash: supervisorPassword,
  //     role: UserRole.SUPERVISOR,
  //     isActive: true,
  //     isVerified: true,
  //   },
  // });

  // const teacher = await prisma.user.upsert({
  //   where: { email: 'teacher@daralkaram.com' },
  //   update: {},
  //   create: {
  //     email: 'teacher@daralkaram.com',
  //     passwordHash: teacherPassword,
  //     role: UserRole.TEACHER,
  //     isActive: true,
  //     isVerified: true,
  //   },
  // });

  // const guardian = await prisma.user.upsert({
  //   where: { phone: '+963987654321' },
  //   update: {},
  //   create: {
  //     phone: '+963987654321',
  //     passwordHash: guardianPassword,
  //     role: UserRole.GUARDIAN,
  //     isActive: true,
  //     isVerified: true,
  //   },
  // });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@daralkaram.com' },
    update: {},
    create: {
      email: 'admin@daralkaram.com',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      isActive: true,
      isVerified: true,
    },
  });
  console.log('✅ Seed completed successfully!');
  console.log('Created users:');
  console.log('- Admin:', admin.email, '(password: 12341234)');
  // console.log('- Supervisor:', supervisor.email, '(password: supervisor123)');
  // console.log('- Teacher:', teacher.email, '(password: teacher123)');
  // console.log('- Guardian:', guardian.phone, '(password: guardian123)');
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
