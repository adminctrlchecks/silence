/**
 * Removes leftover E2E/smoke test content from the Silence content tables.
 *
 * Dry-run is the default:
 *   pnpm --filter @silence/api test-data:clean
 *
 * Execute deletes:
 *   pnpm --filter @silence/api test-data:clean -- --execute
 *   CLEAN_TEST_DATA=1 pnpm --filter @silence/api test-data:clean
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PREFIXES = ['E2E', 'P2-3', 'P2-4', 'smoke', 'P24', 'E2E admin'];
const execute = process.argv.includes('--execute') || process.env.CLEAN_TEST_DATA === '1';

function prefixWhere(field: 'text' | 'title') {
  return { OR: PREFIXES.map((prefix) => ({ [field]: { startsWith: prefix } })) };
}

function summarize<T extends { id: string }>(label: string, rows: T[], describe: (row: T) => string) {
  // eslint-disable-next-line no-console
  console.log(`${label}: ${rows.length}`);
  for (const row of rows.slice(0, 20)) {
    // eslint-disable-next-line no-console
    console.log(`  - ${row.id}: ${describe(row)}`);
  }
  if (rows.length > 20) {
    // eslint-disable-next-line no-console
    console.log(`  ... ${rows.length - 20} more`);
  }
}

async function main() {
  const [questions, answers, remedies] = await Promise.all([
    prisma.question.findMany({
      where: prefixWhere('text'),
      select: { id: true, level: true, category: true, text: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.answer.findMany({
      where: prefixWhere('text'),
      select: { id: true, level: true, category: true, text: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.remedy.findMany({
      where: prefixWhere('title'),
      select: { id: true, category: true, title: true },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  // eslint-disable-next-line no-console
  console.log(`Test-data cleanup ${execute ? 'EXECUTE' : 'DRY RUN'} for prefixes: ${PREFIXES.join(', ')}`);
  summarize('Questions', questions, (q) => `${q.level}/${q.category}: ${q.text}`);
  summarize('Answers', answers, (a) => `${a.level}/${a.category}: ${a.text}`);
  summarize('Remedies', remedies, (r) => `${r.category}: ${r.title}`);

  if (!execute) {
    // eslint-disable-next-line no-console
    console.log('No rows deleted. Re-run with -- --execute or CLEAN_TEST_DATA=1 to delete these rows.');
    return;
  }

  const [deletedAnswers, deletedRemedies, deletedQuestions] = await prisma.$transaction([
    prisma.answer.deleteMany({ where: { id: { in: answers.map((a) => a.id) } } }),
    prisma.remedy.deleteMany({ where: { id: { in: remedies.map((r) => r.id) } } }),
    prisma.question.deleteMany({ where: { id: { in: questions.map((q) => q.id) } } }),
  ]);

  // eslint-disable-next-line no-console
  console.log(
    `Deleted ${deletedQuestions.count} questions, ${deletedAnswers.count} answers, ` +
      `${deletedRemedies.count} remedies. Translation rows were removed by cascade.`,
  );
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
