// @ts-nocheck
declare var process: any;
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = ['User 1', 'User 2', 'User 3'];

  console.log('Seeding users...');
  
  for (const name of users) {
    const existing = await prisma.user.findFirst({ where: { userName: name } });
    if (!existing) {
      await prisma.user.create({
        data: {
          userName: name,
          totalStorageUsed: 0
        }
      });
      console.log(`Created ${name}`);
    } else {
      console.log(`${name} already exists`);
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
