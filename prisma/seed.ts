import { PrismaPg } from '@prisma/adapter-pg';
import { hashSync } from 'bcryptjs';
import { config as dotenvConfig } from 'dotenv';

import { PrismaClient } from '../.generated/prisma/client';

dotenvConfig();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

(async () => {
  await prisma.$connect();

  await seedUsers();

  await prisma.$disconnect();
})();

async function seedUsers() {
  console.log('Seeding users...');
  await prisma.user.createMany({
    data: {
      name: 'Nasreddine Bac Ali',
      email: 'nasreddine.bacali95@gmail.com',
      password: hashSync('admin', 10),
    },
    skipDuplicates: true,
  });
}
