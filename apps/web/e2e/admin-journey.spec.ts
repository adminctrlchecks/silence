import { expect, test } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const apiEnvPath = resolve(__dirname, '../../api/.env');
const apiEnv = existsSync(apiEnvPath) ? readFileSync(apiEnvPath, 'utf8') : '';

function envValue(name: string) {
  const match = apiEnv.match(new RegExp(`^${name}=(.*)$`, 'm'));
  return match?.[1]?.trim().replace(/^"(.*)"$/, '$1');
}

const adminEmail =
  process.env.E2E_ADMIN_EMAIL ?? process.env.SEED_ADMIN_EMAIL ?? envValue('SEED_ADMIN_EMAIL') ?? 'admin@example.com';
const adminPassword =
  process.env.E2E_ADMIN_PASSWORD ?? process.env.SEED_ADMIN_PASSWORD ?? envValue('SEED_ADMIN_PASSWORD') ?? 'change-me';

test('admin content-building journey: login, question, answer, remedy', async ({ page }) => {
  const runId = Date.now().toString(36);
  const questionText = `E2E admin question ${runId}`;
  const remedyTitle = `E2E admin remedy ${runId}`;

  // 1. Admin login.
  await page.goto('/admin/login');
  await page.locator('#email').fill(adminEmail);
  await page.locator('#password').fill(adminPassword);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/admin$/);

  // 2. Create a question (common / male — kept off 'female' to avoid colliding
  //    with the user-journey remedy resolution) and see it in the list.
  await page.goto('/admin/questions');
  await page.locator('#level').selectOption('common');
  await page.locator('#category').selectOption('male');
  await page.locator('#order').fill('1');
  await page.locator('#text').fill(questionText);
  await page.getByRole('button', { name: 'Add question' }).click();
  await expect(page.getByText(questionText)).toBeVisible();

  // 3. Create an admin answer linked to that question.
  await page.goto('/admin/answers');
  await page.locator('#answerQuestion').selectOption({ label: `Common / Male / ${questionText}` });
  await page.locator('#answerLevel').selectOption('level1');
  await page.locator('#answerCategory').selectOption('male');
  await page.locator('#answerSource').selectOption('admin');
  await page.locator('#answerText').fill(`E2E admin answer ${runId}`);
  await page.getByRole('button', { name: 'Add answer' }).click();
  await expect(page.getByText('Answer created.')).toBeVisible();

  // 4. Create a remedy for the category and see it listed.
  await page.goto('/admin/remedies');
  await page.locator('#category').selectOption('male');
  await page.locator('#title').fill(remedyTitle);
  await page.locator('#text').fill('Keep a steady bedtime and revisit the chart notes.');
  await page.getByRole('button', { name: 'Add remedy' }).click();
  await expect(page.getByText(remedyTitle)).toBeVisible();
});
