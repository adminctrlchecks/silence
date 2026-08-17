import { expect, request, test, type APIRequestContext } from '@playwright/test';
import type { Answer, Category, Level, Question, Remedy } from '@silence/shared';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const apiBaseURL = process.env.E2E_API_URL ?? 'http://127.0.0.1:3010/api/v1';
const apiEnvPath = resolve(__dirname, '../../api/.env');
const apiEnv = existsSync(apiEnvPath) ? readFileSync(apiEnvPath, 'utf8') : '';

function envValue(name: string) {
  const match = apiEnv.match(new RegExp(`^${name}=(.*)$`, 'm'));
  return match?.[1]?.trim().replace(/^"(.*)"$/, '$1');
}

const adminEmail =
  process.env.E2E_ADMIN_EMAIL ??
  process.env.SEED_ADMIN_EMAIL ??
  envValue('SEED_ADMIN_EMAIL') ??
  'admin@example.com';
const adminPassword =
  process.env.E2E_ADMIN_PASSWORD ??
  process.env.SEED_ADMIN_PASSWORD ??
  envValue('SEED_ADMIN_PASSWORD') ??
  'change-me';

type AdminSeed = {
  category: Category;
  questions: Record<Level, Question>;
  remedy: Remedy;
};

async function adminToken(api: APIRequestContext) {
  const response = await api.post(`${apiBaseURL}/auth/admin/login`, {
    data: { email: adminEmail, password: adminPassword },
  });
  if (!response.ok()) {
    throw new Error(`Admin login failed: ${response.status()} ${await response.text()}`);
  }
  const body = (await response.json()) as { token: string };
  return body.token;
}

async function apiPost<T>(api: APIRequestContext, token: string, path: string, data: unknown) {
  const response = await api.post(`${apiBaseURL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    data,
  });
  expect(response.ok()).toBeTruthy();
  return (await response.json()) as T;
}

async function seedUserJourneyContent(): Promise<AdminSeed> {
  const api = await request.newContext({ baseURL: apiBaseURL });
  const token = await adminToken(api);
  const runId = Date.now().toString(36);
  const category: Category = 'female';

  const common = await apiPost<Question>(api, token, '/admin/questions', {
    level: 'common',
    category,
    text: `E2E common sleep check ${runId}`,
    order: 1,
  });
  const level1 = await apiPost<Question>(api, token, '/admin/questions', {
    level: 'level1',
    category,
    text: `E2E level 1 rhythm check ${runId}`,
    order: 2,
  });
  const level2 = await apiPost<Question>(api, token, '/admin/questions', {
    level: 'level2',
    category,
    text: `E2E level 2 reflection ${runId}`,
    order: 3,
  });

  for (const question of [common, level1, level2]) {
    await apiPost<Answer>(api, token, '/admin/answers', {
      questionId: question.id,
      level: question.level === 'common' ? 'level1' : question.level,
      category,
      text: `E2E reviewed answer for ${question.text}`,
      source: 'admin',
    });
  }

  const remedy = await apiPost<Remedy>(api, token, '/admin/remedies', {
    category,
    title: `E2E remedy ${runId}`,
    text: 'Keep a steady bedtime and review the chart notes calmly.',
    linkedTo: { level: 'level2', questionId: level2.id },
  });

  await api.dispose();
  return { category, questions: { common, level1, level2 }, remedy };
}

test('full reading journey: register, start reading, answer partial, refresh/resume, finish, chart, remedy, history', async ({ page }) => {
  const seed = await seedUserJourneyContent();
  const contact = `e2e-${Date.now()}@example.com`;

  // 1. Pick — the SessionPicker uses buttons (native language name + category label).
  await page.goto('/');
  await page.getByRole('button', { name: new RegExp(seed.category, 'i') }).click();
  await page.getByRole('button', { name: 'English', exact: true }).click();

  // 2. Register — a progressive 3-step form (identity / birth details /
  // account & consent); each step's fields are targeted by their stable
  // id/name attributes, advancing with "Continue" between steps.
  await page.getByRole('link', { name: 'Create profile' }).click();
  await expect(page).toHaveURL(/\/register$/);

  // Step 1: identity.
  await page.locator('#name').fill('E2E Asha');
  await page.locator('#category').selectOption(seed.category);
  await page.locator('#lang').selectOption('en');
  await page.getByRole('button', { name: 'Continue' }).click();

  // Step 2: birth details.
  await page.locator('#dob').fill('1998-04-21');
  await page.locator('#timeOfBirth').fill('07:35');
  await page.locator('#city').fill('Chennai');
  await page.locator('[role="listbox"]').waitFor({ state: 'visible' });
  await page.locator('[role="listbox"] li').first().click();
  await page.getByRole('button', { name: 'Continue' }).click();

  // Step 3: account & consent.
  await page.locator('#contact').fill(contact);
  await page.locator('#password').fill('password123');
  await page.locator('input[name="consent"]').check();
  await page.getByRole('button', { name: 'Create profile' }).click();

  // 3. Dashboard: a fresh user lands on a guided dashboard, not a blank menu.
  await expect(page).toHaveURL(/\/app$/);
  await expect(page.getByRole('heading', { name: 'Your reading dashboard' })).toBeVisible();
  await expect(page.getByText("You don't have an active reading yet.")).toBeVisible();

  // Fills every answer field currently on screen (there may be more than the
  // one question this test seeded, if other content already exists for this
  // category) so "Save and continue" is never blocked by an unrelated field.
  async function fillAllVisibleAnswers(prefix: string) {
    const fields = page.getByPlaceholder('Write a few honest lines...');
    const count = await fields.count();
    for (let i = 0; i < count; i++) {
      await fields.nth(i).fill(`${prefix} ${i + 1}`);
    }
  }

  // 4. Start reading — creates the ReadingSession.
  await page.getByRole('link', { name: 'Start your reading' }).click();
  await expect(page).toHaveURL(/\/app\/questions$/);
  await expect(page.getByText(seed.questions.common.text)).toBeVisible();

  // 5. Answer partial: only the common level, then save and continue.
  await fillAllVisibleAnswers('E2E common answer');
  await page.getByRole('button', { name: 'Save and continue' }).click();
  await expect(page.getByText(seed.questions.level1.text)).toBeVisible();

  // 6. Refresh/resume: reloading mid-flow must not lose the saved common answer
  // or send the user back to step 1 — it resumes on the next incomplete level.
  await page.reload();
  await expect(page.getByText(seed.questions.level1.text)).toBeVisible();
  await expect(page.getByText(seed.questions.common.text)).not.toBeVisible();

  // 7. Answer level 1, continue.
  await fillAllVisibleAnswers('E2E level1 answer');
  await page.getByRole('button', { name: 'Save and continue' }).click();
  await expect(page.getByText(seed.questions.level2.text)).toBeVisible();

  // 8. Finish: answer level 2 (the final layer) and save.
  await fillAllVisibleAnswers('E2E level2 answer');
  await page.getByRole('button', { name: 'Save final layer' }).click();
  await expect(page.getByRole('link', { name: 'Open your chart' })).toBeVisible();

  // 9. Chart — generated from the same reading session. Ephemeris + Gemini
  // interpretation can take a few seconds, so give this step more headroom.
  await page.getByRole('link', { name: 'Open your chart' }).click();
  await expect(page.getByRole('heading', { name: 'Your astrology chart' })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText('Chart reading')).toBeVisible();

  // 10. Remedy — resolved and snapshotted for this session.
  await page.goto('/app/remedy');
  await expect(page.getByRole('heading', { name: seed.remedy.title })).toBeVisible();
  await expect(page.getByText(seed.remedy.text)).toBeVisible();

  // 11. Dashboard reflects the completed reading and offers to start a new one.
  await page.goto('/app');
  await expect(page.getByRole('link', { name: 'Start a new reading' })).toBeVisible();
  await expect(page.getByText('1 completed readings')).toBeVisible();

  // 12. History shows the reading as one coherent session, not loose rows.
  await page.goto('/history');
  await expect(page.getByText('Complete', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'View details' }).click();
  await expect(page.getByText('E2E common answer').first()).toBeVisible();
  await expect(page.getByText('E2E level1 answer').first()).toBeVisible();
  await expect(page.getByText('E2E level2 answer').first()).toBeVisible();
  await expect(page.getByText(seed.remedy.title)).toBeVisible();
});
