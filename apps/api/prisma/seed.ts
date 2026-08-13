import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { LANGUAGES } from '@silence/shared';

const prisma = new PrismaClient();

async function main() {
  // Seed the 11 starting languages.
  for (const l of LANGUAGES) {
    await prisma.language.upsert({
      where: { code: l.code },
      create: { code: l.code, name: l.name, rtl: l.dir === 'rtl' },
      update: { name: l.name, rtl: l.dir === 'rtl' },
    });
  }

  // Seed the first admin from env.
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com';
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'change-me';
  await prisma.admin.upsert({
    where: { email },
    create: { email, name: 'Admin', passwordHash: await bcrypt.hash(password, 10) },
    update: {},
  });

  // eslint-disable-next-line no-console
  console.log(`Seeded ${LANGUAGES.length} languages and admin <${email}>.`);
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
