import { Injectable, NotFoundException } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { Prisma, ImportType as PrismaImportType } from '@prisma/client';
import { CATEGORIES, type Category, type ImportType } from '@silence/shared';
import { PrismaService } from '../prisma/prisma.service';

interface RowError {
  row: number; // 1-based spreadsheet row (header is row 1)
  message: string;
}

interface IngestResult {
  created: number;
  updated: number;
  errors: RowError[];
}

/** The shared contract uses hyphens ("answers-level1"); Prisma's enum uses underscores. */
const IMPORT_TYPE_TO_DB: Record<ImportType, PrismaImportType> = {
  questions: PrismaImportType.questions,
  'answers-level1': PrismaImportType.answers_level1,
  'answers-level2': PrismaImportType.answers_level2,
  remedies: PrismaImportType.remedies,
};

function str(v: unknown): string {
  return v === null || v === undefined ? '' : String(v).trim();
}

function isCategory(v: string): v is Category {
  return (CATEGORIES as readonly string[]).includes(v);
}

/**
 * Import Mode — bulk load Common Questions / Level 1 & 2 answers / Remedies from
 * an .xlsx file (docs/API.md §6). Each row is validated individually: valid rows
 * are upserted (create or update, counted separately) and invalid rows are
 * collected as errors with a 1-based row number and reason, so one bad row never
 * aborts the whole import. Processing is synchronous; move to a Redis-backed
 * queue if imports grow large.
 */
@Injectable()
export class ImportService {
  constructor(private readonly prisma: PrismaService) {}

  async importFile(type: ImportType, buffer: Buffer) {
    const job = await this.prisma.importJob.create({
      data: { type: IMPORT_TYPE_TO_DB[type], status: 'processing' },
    });
    try {
      const rows = this.parse(buffer);
      const result = await this.ingest(type, rows);
      const done = await this.prisma.importJob.update({
        where: { id: job.id },
        data: {
          status: 'done',
          created: result.created,
          updated: result.updated,
          errors: result.errors as unknown as Prisma.InputJsonValue,
        },
      });
      return {
        jobId: done.id,
        status: done.status,
        created: done.created,
        updated: done.updated,
        errors: result.errors,
      };
    } catch (e) {
      await this.prisma.importJob.update({
        where: { id: job.id },
        data: {
          status: 'failed',
          errors: [{ row: 0, message: (e as Error).message }] as unknown as Prisma.InputJsonValue,
        },
      });
      return { jobId: job.id, status: 'failed', created: 0, updated: 0, errors: [{ row: 0, message: (e as Error).message }] };
    }
  }

  async status(jobId: string) {
    const job = await this.prisma.importJob.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Import job not found');
    return {
      jobId: job.id,
      status: job.status,
      created: job.created,
      updated: job.updated,
      errors: job.errors,
    };
  }

  private parse(buffer: Buffer): Record<string, unknown>[] {
    const wb = XLSX.read(buffer, { type: 'buffer' });
    const name = wb.SheetNames[0];
    if (!name) throw new Error('The uploaded file has no sheets');
    const sheet = wb.Sheets[name];
    return XLSX.utils.sheet_to_json(sheet, { defval: '' });
  }

  private async ingest(type: ImportType, rows: Record<string, unknown>[]): Promise<IngestResult> {
    switch (type) {
      case 'questions':
        return this.ingestRows(rows, (r, n) => this.upsertQuestion(r, n));
      case 'answers-level1':
        return this.ingestRows(rows, (r, n) => this.upsertAnswer(r, n, 'level1'));
      case 'answers-level2':
        return this.ingestRows(rows, (r, n) => this.upsertAnswer(r, n, 'level2'));
      case 'remedies':
        return this.ingestRows(rows, (r, n) => this.upsertRemedy(r, n));
    }
  }

  /** Runs `handler` per row, tallying created/updated and collecting row errors. */
  private async ingestRows(
    rows: Record<string, unknown>[],
    handler: (row: Record<string, unknown>, rowNumber: number) => Promise<'created' | 'updated'>,
  ): Promise<IngestResult> {
    const errors: RowError[] = [];
    let created = 0;
    let updated = 0;
    for (let i = 0; i < rows.length; i++) {
      const rowNumber = i + 2; // +1 for 0-index, +1 for the header row
      try {
        const outcome = await handler(rows[i], rowNumber);
        if (outcome === 'created') created++;
        else updated++;
      } catch (e) {
        errors.push({ row: rowNumber, message: (e as Error).message });
      }
    }
    return { created, updated, errors };
  }

  private async upsertQuestion(row: Record<string, unknown>, _n: number): Promise<'created' | 'updated'> {
    const level = str(row.level) || 'common';
    const category = str(row.category);
    const text = str(row.text);
    const orderRaw = str(row.order);
    if (!['common', 'level1', 'level2'].includes(level)) throw new Error(`Invalid level "${level}"`);
    if (!isCategory(category)) throw new Error(`Invalid category "${category}" (expected male|female|other)`);
    if (!text) throw new Error('text is required');
    const order = orderRaw ? Number(orderRaw) : 0;
    if (Number.isNaN(order)) throw new Error(`order "${orderRaw}" is not a number`);

    const existing = await this.prisma.question.findFirst({
      where: { level: level as never, category: category as never, text },
    });
    if (existing) {
      await this.prisma.question.update({ where: { id: existing.id }, data: { order } });
      return 'updated';
    }
    await this.prisma.question.create({
      data: { level: level as never, category: category as never, text, order },
    });
    return 'created';
  }

  private async upsertAnswer(
    row: Record<string, unknown>,
    _n: number,
    level: 'level1' | 'level2',
  ): Promise<'created' | 'updated'> {
    const questionId = str(row.questionId);
    const category = str(row.category);
    const text = str(row.text);
    if (!questionId) throw new Error('questionId is required');
    if (!isCategory(category)) throw new Error(`Invalid category "${category}" (expected male|female|other)`);
    if (!text) throw new Error('text is required');

    const question = await this.prisma.question.findUnique({ where: { id: questionId } });
    if (!question) throw new Error(`questionId "${questionId}" does not exist`);

    const existing = await this.prisma.answer.findFirst({
      where: { questionId, level: level as never, category: category as never },
    });
    if (existing) {
      await this.prisma.answer.update({
        where: { id: existing.id },
        data: { text, source: 'admin', reviewed: true },
      });
      return 'updated';
    }
    await this.prisma.answer.create({
      data: {
        questionId,
        level: level as never,
        category: category as never,
        text,
        source: 'admin',
        reviewed: true,
      },
    });
    return 'created';
  }

  private async upsertRemedy(row: Record<string, unknown>, _n: number): Promise<'created' | 'updated'> {
    const category = str(row.category);
    const title = str(row.title);
    const text = str(row.text);
    if (!isCategory(category)) throw new Error(`Invalid category "${category}" (expected male|female|other)`);
    if (!title) throw new Error('title is required');
    if (!text) throw new Error('text is required');

    const existing = await this.prisma.remedy.findFirst({ where: { category: category as never, title } });
    if (existing) {
      await this.prisma.remedy.update({ where: { id: existing.id }, data: { text } });
      return 'updated';
    }
    await this.prisma.remedy.create({ data: { category: category as never, title, text } });
    return 'created';
  }

  /** Column headers for the downloadable template (GET /admin/import/template). */
  templateColumns(type: ImportType): string[] {
    switch (type) {
      case 'questions':
        return ['level', 'category', 'text', 'order'];
      case 'answers-level1':
      case 'answers-level2':
        return ['questionId', 'category', 'text'];
      case 'remedies':
        return ['category', 'title', 'text'];
    }
  }

  /** An example row to seed the template so admins see the expected shape. */
  templateExample(type: ImportType): (string | number)[] {
    switch (type) {
      case 'questions':
        return ['common', 'female', 'How many hours do you sleep?', 1];
      case 'answers-level1':
        return ['<question-id>', 'female', 'Aim for 7–8 hours of sleep.'];
      case 'answers-level2':
        return ['<question-id>', 'female', 'Keep a consistent sleep/wake time.'];
      case 'remedies':
        return ['female', 'Sleep hygiene', 'Keep a consistent bedtime and a dark, cool room.'];
    }
  }
}
