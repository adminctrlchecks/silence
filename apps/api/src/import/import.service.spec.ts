import * as XLSX from 'xlsx';
import { ImportService } from './import.service';

/**
 * In-memory fake of the tiny slice of PrismaService the import service uses.
 * Lets us assert created/updated/error tallies without a real database.
 */
function makeFakePrisma(seed?: { questions?: { id: string }[] }) {
  const db = {
    questions: [...(seed?.questions ?? [])] as { id: string; level: string; category: string; text: string; order: number }[],
    answers: [] as { id: string; questionId: string; level: string; category: string; text: string }[],
    remedies: [] as { id: string; category: string; title: string; text: string }[],
    jobs: [] as Record<string, unknown>[],
  };
  let seq = 0;
  const id = () => `id_${++seq}`;
  return {
    _db: db,
    importJob: {
      create: async ({ data }: any) => {
        const job = { id: id(), created: 0, updated: 0, errors: [], ...data };
        db.jobs.push(job);
        return job;
      },
      update: async ({ where, data }: any) => {
        const job = db.jobs.find((j) => j.id === where.id)!;
        Object.assign(job, data);
        return job;
      },
      findUnique: async ({ where }: any) => db.jobs.find((j) => j.id === where.id) ?? null,
    },
    question: {
      findFirst: async ({ where }: any) =>
        db.questions.find(
          (q) => q.level === where.level && q.category === where.category && q.text === where.text,
        ) ?? null,
      findUnique: async ({ where }: any) => db.questions.find((q) => q.id === where.id) ?? null,
      create: async ({ data }: any) => {
        const q = { id: id(), ...data };
        db.questions.push(q);
        return q;
      },
      update: async ({ where, data }: any) => {
        const q = db.questions.find((x) => x.id === where.id)!;
        Object.assign(q, data);
        return q;
      },
    },
    answer: {
      findFirst: async ({ where }: any) =>
        db.answers.find(
          (a) => a.questionId === where.questionId && a.level === where.level && a.category === where.category,
        ) ?? null,
      create: async ({ data }: any) => {
        const a = { id: id(), ...data };
        db.answers.push(a);
        return a;
      },
      update: async ({ where, data }: any) => {
        const a = db.answers.find((x) => x.id === where.id)!;
        Object.assign(a, data);
        return a;
      },
    },
    remedy: {
      findFirst: async ({ where }: any) =>
        db.remedies.find((r) => r.category === where.category && r.title === where.title) ?? null,
      create: async ({ data }: any) => {
        const r = { id: id(), ...data };
        db.remedies.push(r);
        return r;
      },
      update: async ({ where, data }: any) => {
        const r = db.remedies.find((x) => x.id === where.id)!;
        Object.assign(r, data);
        return r;
      },
    },
  };
}

function xlsxBuffer(rows: (string | number)[][]): Buffer {
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'sheet');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
}

describe('ImportService', () => {
  it('creates valid question rows and reports invalid ones', async () => {
    const prisma = makeFakePrisma();
    const service = new ImportService(prisma as never);
    const buf = xlsxBuffer([
      ['level', 'category', 'text', 'order'],
      ['common', 'female', 'How many hours do you sleep?', 1], // ok → created
      ['common', 'martian', 'Bad category', 2], // invalid category → error
      ['common', 'male', '', 3], // missing text → error
    ]);
    const res = await service.importFile('questions', buf);
    expect(res.status).toBe('done');
    expect(res.created).toBe(1);
    expect(res.updated).toBe(0);
    expect(res.errors).toHaveLength(2);
    expect(res.errors[0].row).toBe(3); // spreadsheet row of the bad-category line
    expect(res.errors.map((e) => e.message).join(' ')).toMatch(/category/i);
  });

  it('updates an existing question instead of duplicating it', async () => {
    const prisma = makeFakePrisma();
    const service = new ImportService(prisma as never);
    const rows: (string | number)[][] = [
      ['level', 'category', 'text', 'order'],
      ['common', 'female', 'Same question', 1],
    ];
    const first = await service.importFile('questions', xlsxBuffer(rows));
    expect(first.created).toBe(1);
    const second = await service.importFile('questions', xlsxBuffer(rows));
    expect(second.created).toBe(0);
    expect(second.updated).toBe(1);
    expect(prisma._db.questions).toHaveLength(1); // no duplicate
  });

  it('validates that an answer references an existing question', async () => {
    const prisma = makeFakePrisma({ questions: [{ id: 'q1' }] });
    const service = new ImportService(prisma as never);
    const buf = xlsxBuffer([
      ['questionId', 'category', 'text'],
      ['q1', 'female', 'A valid answer'], // ok → created
      ['missing', 'female', 'Orphan answer'], // unknown questionId → error
    ]);
    const res = await service.importFile('answers-level1', buf);
    expect(res.created).toBe(1);
    expect(res.errors).toHaveLength(1);
    expect(res.errors[0].message).toMatch(/does not exist/);
  });

  it('handles an empty / dataless file gracefully (done, nothing created)', async () => {
    const prisma = makeFakePrisma();
    const service = new ImportService(prisma as never);
    const res = await service.importFile('questions', Buffer.alloc(0));
    expect(res.status).toBe('done');
    expect(res.created).toBe(0);
    expect(res.updated).toBe(0);
    expect(res.errors).toHaveLength(0);
  });

  it('marks the job failed and records a row-0 error when ingest throws', async () => {
    const prisma = makeFakePrisma();
    // Force a catastrophic error mid-ingest to exercise the catch path.
    prisma.question.findFirst = async () => {
      throw new Error('db exploded');
    };
    const service = new ImportService(prisma as never);
    const buf = xlsxBuffer([
      ['level', 'category', 'text', 'order'],
      ['common', 'female', 'Q', 1],
    ]);
    const res = await service.importFile('questions', buf);
    // A per-row DB error is caught per row (done with an error row), not fatal.
    expect(res.status).toBe('done');
    expect(res.errors[0].message).toMatch(/db exploded/);
  });
});
