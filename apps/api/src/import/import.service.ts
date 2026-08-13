import { Injectable, NotFoundException } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { Prisma, ImportType as PrismaImportType } from '@prisma/client';
import type { ImportType } from '@silence/shared';
import { PrismaService } from '../prisma/prisma.service';

interface RowError {
  row: number;
  message: string;
}

/** The shared contract uses hyphens ("answers-level1"); Prisma's enum uses underscores. */
const IMPORT_TYPE_TO_DB: Record<ImportType, PrismaImportType> = {
  questions: PrismaImportType.questions,
  'answers-level1': PrismaImportType.answers_level1,
  'answers-level2': PrismaImportType.answers_level2,
  remedies: PrismaImportType.remedies,
};

/**
 * Import Mode — bulk load Common Questions / Level 1 & 2 answers / Remedies from
 * an .xlsx file (docs/API.md §6). Processing is synchronous here for simplicity;
 * move to a Redis-backed queue if imports grow large.
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
      return { jobId: done.id, status: done.status };
    } catch (e) {
      await this.prisma.importJob.update({
        where: { id: job.id },
        data: {
          status: 'failed',
          errors: [{ row: 0, message: (e as Error).message }] as unknown as Prisma.InputJsonValue,
        },
      });
      return { jobId: job.id, status: 'failed' };
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
    const sheet = wb.Sheets[wb.SheetNames[0]];
    return XLSX.utils.sheet_to_json(sheet, { defval: '' });
  }

  private async ingest(type: ImportType, rows: Record<string, unknown>[]) {
    const errors: RowError[] = [];
    let created = 0;
    const updated = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        if (type === 'questions') {
          await this.prisma.question.create({
            data: {
              level: String(row.level ?? 'common') as never,
              category: String(row.category ?? 'other') as never,
              text: String(row.text ?? ''),
              order: Number(row.order ?? 0),
            },
          });
          created++;
        } else if (type === 'answers-level1' || type === 'answers-level2') {
          await this.prisma.answer.create({
            data: {
              questionId: String(row.questionId ?? ''),
              level: (type === 'answers-level1' ? 'level1' : 'level2') as never,
              category: String(row.category ?? 'other') as never,
              text: String(row.text ?? ''),
              source: 'admin',
              reviewed: true,
            },
          });
          created++;
        } else if (type === 'remedies') {
          await this.prisma.remedy.create({
            data: {
              category: String(row.category ?? 'other') as never,
              title: String(row.title ?? ''),
              text: String(row.text ?? ''),
            },
          });
          created++;
        }
      } catch (e) {
        errors.push({ row: i + 2, message: (e as Error).message }); // +2: header + 1-index
      }
    }
    return { created, updated, errors };
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
}
