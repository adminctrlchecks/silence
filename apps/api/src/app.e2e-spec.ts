import { execSync } from 'node:child_process';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import request from 'supertest';
import * as XLSX from 'xlsx';
import { PrismaService } from './prisma/prisma.service';
import { GeminiService } from './integrations/gemini/gemini.service';
import { HttpExceptionFilter } from './common/http-exception.filter';

jest.setTimeout(60_000);

const TEST_SCHEMA = 'silence_e2e';
const DEFAULT_TEST_DATABASE_URL =
  'postgresql://silence_user:silence_pass@localhost:5432/silence_db?schema=silence_e2e';

function testDatabaseUrl() {
  const url = new URL(process.env.TEST_DATABASE_URL ?? DEFAULT_TEST_DATABASE_URL);
  url.searchParams.set('schema', TEST_SCHEMA);
  return url.toString();
}

function databaseUrlForSchema(schema: string) {
  const url = new URL(testDatabaseUrl());
  url.searchParams.set('schema', schema);
  return url.toString();
}

function quoteIdentifier(identifier: string) {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(identifier)) {
    throw new Error(`Unsafe SQL identifier: ${identifier}`);
  }
  return `"${identifier}"`;
}

async function resetSchema() {
  const prisma = new PrismaClient({
    datasources: { db: { url: databaseUrlForSchema('public') } },
  });
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS ${quoteIdentifier(TEST_SCHEMA)} CASCADE`);
  await prisma.$executeRawUnsafe(`CREATE SCHEMA ${quoteIdentifier(TEST_SCHEMA)}`);
  await prisma.$disconnect();
}

function migrateTestSchema() {
  const env = Object.fromEntries(
    Object.entries(process.env).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
  );
  execSync('pnpm exec prisma migrate deploy --schema prisma/schema.prisma', {
    cwd: process.cwd(),
    env: { ...env, DATABASE_URL: testDatabaseUrl() },
    stdio: 'pipe',
  });
}

function xlsxBuffer(rows: (string | number)[][]): Buffer {
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'sheet');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
}

describe('Silence API e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    process.env.DATABASE_URL = testDatabaseUrl();
    process.env.JWT_ADMIN_SECRET = 'e2e-admin-secret';
    process.env.JWT_USER_SECRET = 'e2e-user-secret';
    process.env.GEMINI_API_KEY = '';

    await resetSchema();
    migrateTestSchema();

    const { AppModule } = await import('./app.module');
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(GeminiService)
      .useValue({
        generateAnswer: jest.fn().mockResolvedValue('Generated answer from e2e Gemini stub'),
        interpretChart: jest.fn().mockResolvedValue('Generated chart interpretation from e2e Gemini stub'),
        translate: jest.fn((text: string, lang: string) => Promise.resolve(`${lang}:${text}`)),
      })
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.admin.create({
      data: {
        email: 'admin@example.com',
        name: 'Admin',
        passwordHash: await bcrypt.hash('admin-password', 10),
      },
    });
  });

  afterAll(async () => {
    if (app) await app.close();
    await resetSchema();
  });

  it('covers health, auth, admin content, import, public flow, and user profile endpoints', async () => {
    const health = await request(app.getHttpServer()).get('/api/v1/health').expect(200);
    expect(health.body).toMatchObject({ status: 'ok', db: 'up' });

    await request(app.getHttpServer()).get('/api/v1/admin/questions').expect(401);

    const adminLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/admin/login')
      .send({ email: 'admin@example.com', password: 'admin-password' })
      .expect(201);
    const adminToken = (adminLogin.body as { token: string }).token;
    expect(adminToken).toBeTruthy();

    const userRegister = await request(app.getHttpServer())
      .post('/api/v1/auth/user/register')
      .send({
        name: 'Asha',
        category: 'female',
        dob: '1998-04-21',
        timeOfBirth: '07:35',
        placeOfBirth: { city: 'Chennai', country: 'IN', lat: 13.08, lng: 80.27 },
        contact: 'asha.e2e@example.com',
        password: 'user-password',
        lang: 'en',
        consent: true,
      })
      .expect(201);
    const userBody = userRegister.body as { token: string; refreshToken: string; user: { id: string } };
    expect(userBody.token).toBeTruthy();

    const userRefresh = await request(app.getHttpServer())
      .post('/api/v1/auth/user/refresh')
      .send({ refreshToken: userBody.refreshToken })
      .expect(201);
    expect((userRefresh.body as { token: string }).token).toBeTruthy();

    const secondUserRegister = await request(app.getHttpServer())
      .post('/api/v1/auth/user/register')
      .send({
        name: 'Dev',
        category: 'other',
        dob: '1995-01-10',
        timeOfBirth: '12:15',
        placeOfBirth: { city: 'Mumbai', country: 'IN', lat: 19.07, lng: 72.88 },
        contact: 'dev.e2e@example.com',
        password: 'user-password',
        lang: 'en',
        consent: true,
      })
      .expect(201);
    const secondUserBody = secondUserRegister.body as { token: string; user: { id: string } };

    await request(app.getHttpServer())
      .get(`/api/v1/users/${userBody.user.id}`)
      .set('Authorization', `Bearer ${secondUserBody.token}`)
      .expect(403);

    await request(app.getHttpServer()).get('/api/v1/languages').expect(200).expect(({ body }) => {
      expect(body.data.length).toBeGreaterThanOrEqual(11);
      expect(body.data).toEqual(expect.arrayContaining([expect.objectContaining({ code: 'ar', rtl: true })]));
    });

    const addedLanguage = await request(app.getHttpServer())
      .post('/api/v1/admin/languages')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ code: 'it', name: 'Italian', rtl: false })
      .expect(201);
    expect(addedLanguage.body).toMatchObject({ code: 'it', name: 'Italian', rtl: false });

    const createdQuestion = await request(app.getHttpServer())
      .post('/api/v1/admin/questions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        level: 'common',
        category: 'female',
        text: 'How many hours do you sleep?',
        order: 1,
        translations: { hi: 'Aap kitne ghante soti hain?' },
      })
      .expect(201);
    const questionId = (createdQuestion.body as { id: string }).id;
    expect(questionId).toBeTruthy();

    await request(app.getHttpServer())
      .get('/api/v1/admin/questions?level=common&category=female&lang=hi&page=1&limit=5')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({ page: 1, limit: 5, total: 1 });
        expect(body.data[0].text).toBe('Aap kitne ghante soti hain?');
      });

    const updatedQuestion = await request(app.getHttpServer())
      .put(`/api/v1/admin/questions/${questionId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ order: 2 })
      .expect(200);
    expect(updatedQuestion.body).toMatchObject({ id: questionId, order: 2 });

    const createdAnswer = await request(app.getHttpServer())
      .post('/api/v1/admin/answers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        questionId,
        level: 'level1',
        category: 'female',
        text: 'Aim for seven to eight hours.',
        source: 'admin',
        translations: { hi: 'Saat se aath ghante ka lakshya rakhein.' },
      })
      .expect(201);
    const answerId = (createdAnswer.body as { id: string }).id;
    expect(createdAnswer.body).toMatchObject({ reviewed: true });

    const generatedAnswer = await request(app.getHttpServer())
      .post('/api/v1/admin/answers/ai-generate')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ questionId, level: 'level2', category: 'female', lang: 'en' })
      .expect(201);
    expect(generatedAnswer.body).toMatchObject({ source: 'ai', saved: true, reviewed: false });
    const generatedAnswerId = (generatedAnswer.body as { id: string }).id;

    await request(app.getHttpServer())
      .put(`/api/v1/admin/answers/${generatedAnswerId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ reviewed: true })
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({ id: generatedAnswerId, source: 'ai', reviewed: true });
      });

    await request(app.getHttpServer())
      .get(`/api/v1/answers?questionId=${questionId}&level=level1&category=female&lang=hi`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.id).toBe(answerId);
        expect(body.text).toBe('Saat se aath ghante ka lakshya rakhein.');
      });

    const createdRemedy = await request(app.getHttpServer())
      .post('/api/v1/admin/remedies')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        category: 'female',
        title: 'Sleep hygiene',
        text: 'Keep a consistent bedtime.',
        linkedTo: { level: 'level2', questionId },
        translations: { hi: 'Niyamit neend' },
      })
      .expect(201);
    const remedyId = (createdRemedy.body as { id: string }).id;
    expect(remedyId).toBeTruthy();

    await request(app.getHttpServer())
      .put(`/api/v1/admin/remedies/${remedyId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ text: 'Keep a consistent bedtime and reduce late caffeine.' })
      .expect(200);

    const chartConfig = await request(app.getHttpServer())
      .put('/api/v1/admin/chart-config')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        category: 'female',
        type: 'astrology',
        style: 'south-indian',
        source: 'level2',
        requires: ['dob', 'timeOfBirth', 'placeOfBirth'],
      })
      .expect(200);
    expect(chartConfig.body).toMatchObject({ category: 'female', style: 'south-indian' });

    await request(app.getHttpServer())
      .get('/api/v1/admin/chart-config?category=female')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .expect(({ body }) => expect(body.style).toBe('south-indian'));

    const translated = await request(app.getHttpServer())
      .post('/api/v1/admin/translations/auto')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ entity: 'answer', id: answerId, targets: ['ja'] })
      .expect(201);
    expect(translated.body).toEqual({ id: answerId, translated: ['ja'], provider: 'gemini' });

    const template = await request(app.getHttpServer())
      .get('/api/v1/admin/import/template?type=questions')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(template.headers['content-type']).toContain(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    const imported = await request(app.getHttpServer())
      .post('/api/v1/admin/import?type=questions')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach(
        'file',
        xlsxBuffer([
          ['level', 'category', 'text', 'order'],
          ['common', 'female', 'Imported e2e question', 3],
          ['common', 'unknown', 'Bad category', 4],
        ]),
        'questions.xlsx',
      )
      .expect(201);
    expect(imported.body).toMatchObject({ status: 'done', created: 1, updated: 0 });
    expect(imported.body.errors).toHaveLength(1);

    const importStatus = await request(app.getHttpServer())
      .get(`/api/v1/admin/import/${imported.body.jobId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(importStatus.body).toMatchObject({ jobId: imported.body.jobId, status: 'done' });

    await request(app.getHttpServer())
      .get('/api/v1/questions?level=common&category=female&lang=hi')
      .expect(200)
      .expect(({ body }) => {
        expect(body.total).toBeGreaterThanOrEqual(1);
        expect(body.data[0]).toEqual(expect.objectContaining({ category: 'female' }));
      });

    await request(app.getHttpServer())
      .post('/api/v1/responses')
      .set('Authorization', `Bearer ${userBody.token}`)
      .send({
        userId: userBody.user.id,
        level: 'level2',
        category: 'female',
        answers: [{ questionId, value: 'I sleep six hours' }],
      })
      .expect(201)
      .expect(({ body }) => expect(body).toEqual({ saved: 1 }));

    await request(app.getHttpServer())
      .get(`/api/v1/users/${userBody.user.id}`)
      .set('Authorization', `Bearer ${userBody.token}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({ id: userBody.user.id, name: 'Asha', category: 'female' });
        expect(body.placeOfBirth).toMatchObject({ city: 'Chennai', country: 'IN' });
        expect(body).not.toHaveProperty('passwordHash');
      });

    await request(app.getHttpServer())
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.total).toBeGreaterThanOrEqual(2);
        expect(body.data[0]).not.toHaveProperty('passwordHash');
        expect(body.data).toEqual(
          expect.arrayContaining([expect.objectContaining({ id: userBody.user.id, responseCount: 1 })]),
        );
      });

    await request(app.getHttpServer())
      .get(`/api/v1/admin/users/${userBody.user.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({ id: userBody.user.id, name: 'Asha' });
        expect(body.responses).toHaveLength(1);
      });

    await request(app.getHttpServer())
      .put(`/api/v1/users/${userBody.user.id}`)
      .set('Authorization', `Bearer ${userBody.token}`)
      .send({ name: 'Asha Updated' })
      .expect(200)
      .expect(({ body }) => expect(body.name).toBe('Asha Updated'));

    const chart = await request(app.getHttpServer())
      .get(`/api/v1/users/${userBody.user.id}/chart?lang=en`)
      .set('Authorization', `Bearer ${userBody.token}`)
      .expect(200);
    expect(chart.body).toMatchObject({
      userId: userBody.user.id,
      category: 'female',
      type: 'astrology',
      style: 'south-indian',
    });
    expect(chart.body.data).toHaveProperty('placements');

    await request(app.getHttpServer())
      .get(`/api/v1/users/${userBody.user.id}/remedy?lang=hi`)
      .set('Authorization', `Bearer ${userBody.token}`)
      .expect(200)
      .expect(({ body }) => expect(body.title).toBe('Sleep hygiene'));

    await request(app.getHttpServer())
      .get(`/api/v1/users/${userBody.user.id}/history?lang=hi`)
      .set('Authorization', `Bearer ${userBody.token}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.userId).toBe(userBody.user.id);
        expect(body.responses).toHaveLength(1);
        expect(body.charts).toHaveLength(1);
      });

    await request(app.getHttpServer())
      .delete(`/api/v1/admin/answers/${answerId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .expect(({ body }) => expect(body).toEqual({ deleted: true }));

    await request(app.getHttpServer())
      .delete(`/api/v1/admin/remedies/${remedyId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .expect(({ body }) => expect(body).toEqual({ deleted: true }));

    await request(app.getHttpServer())
      .delete(`/api/v1/admin/questions/${questionId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .expect(({ body }) => expect(body).toEqual({ deleted: true }));
  });
});
