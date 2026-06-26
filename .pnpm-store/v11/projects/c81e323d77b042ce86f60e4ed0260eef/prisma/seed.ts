import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const roles = ['ADMIN', 'INSTRUCTOR', 'STUDENT'];
  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log('Roles created: ADMIN, INSTRUCTOR, STUDENT');

  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
  const instructorRole = await prisma.role.findUnique({ where: { name: 'INSTRUCTOR' } });

  if (adminRole) {
    const adminEmail = 'admin@sarriatech.com';
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!existingAdmin) {
      await prisma.user.create({
        data: {
          name: 'Administrador',
          email: adminEmail,
          password: await bcrypt.hash('admin123', 10),
          roleId: adminRole.id,
        },
      });
      console.log('Admin user created: admin@sarriatech.com / admin123');
    }
  }

  if (instructorRole) {
    const instructorEmail = 'instructor@sarriatech.com';
    const existingInstructor = await prisma.user.findUnique({ where: { email: instructorEmail } });
    if (!existingInstructor) {
      await prisma.user.create({
        data: {
          name: 'Instructor Demo',
          email: instructorEmail,
          password: await bcrypt.hash('instructor123', 10),
          roleId: instructorRole.id,
        },
      });
      console.log('Instructor user created: instructor@sarriatech.com / instructor123');
    }
  }

  const categories = [
    'Desarrollo Web',
    'Inteligencia Artificial',
    'Ciberseguridad',
    'Bases de Datos',
    'Diseno UX/UI',
    'DevOps y Cloud',
    'Mobile Development',
    'Data Science',
  ];

  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`${categories.length} Categories created`);

  console.log('Seed complete!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
