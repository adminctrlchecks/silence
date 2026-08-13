#!/usr/bin/env node
/**
 * Smoke test: hit one endpoint per API module and assert a 2xx response.
 * Requires the API running (default http://localhost:3010/api/v1) and a seeded
 * admin (SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD).
 *
 *   pnpm --filter @silence/api smoke
 *
 * Exits 0 if every check is 2xx, 1 otherwise.
 */
const BASE = process.env.API_BASE_URL ?? 'http://localhost:3010/api/v1';
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'change-me';

const results = [];
let adminToken = '';
let userToken = '';
let userId = '';

async function hit(module, method, path, { token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  let status = 0;
  let json = null;
  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    status = res.status;
    const text = await res.text();
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = text?.slice(0, 60);
    }
  } catch (err) {
    results.push({ module, method, path, status: 'ERR', ok: false, note: String(err) });
    return null;
  }
  const ok = status >= 200 && status < 300;
  results.push({ module, method, path, status, ok });
  return json;
}

async function main() {
  // 1. health
  const health = await hit('health', 'GET', '/health');
  if (health && health.db !== 'up') {
    results.push({ module: 'health', method: '-', path: 'db check', status: health.db, ok: false });
  }

  // 2. languages (public)
  await hit('languages', 'GET', '/languages');

  // 3. auth — admin login (also yields the admin token for guarded routes)
  const login = await hit('auth', 'POST', '/auth/admin/login', {
    body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  adminToken = login?.token ?? '';

  // 4. questions (admin list)
  await hit('questions', 'GET', '/admin/questions?level=common&category=male', { token: adminToken });

  // 5. answers (admin list)
  await hit('answers', 'GET', '/admin/answers', { token: adminToken });

  // 6. remedies (admin list)
  await hit('remedies', 'GET', '/admin/remedies', { token: adminToken });

  // 7. chart (admin config — returns a default when unset)
  await hit('chart', 'GET', '/admin/chart-config?category=female', { token: adminToken });

  // 8. import (admin template download)
  await hit('import', 'GET', '/admin/import/template?type=questions', { token: adminToken });

  // 9. responses (public user-facing questions feed)
  await hit('responses', 'GET', '/questions?level=common&category=male&lang=en');

  // 10. users — register then read own profile
  const reg = await hit('auth', 'POST', '/auth/user/register', {
    body: {
      name: 'Smoke User',
      category: 'other',
      dob: '1990-01-01',
      timeOfBirth: '12:00',
      placeOfBirth: { city: 'Chennai', country: 'IN' },
      contact: `smoke+${Date.now()}@example.com`,
      lang: 'en',
      consent: true,
    },
  });
  userToken = reg?.token ?? '';
  userId = reg?.user?.id ?? '';
  if (userId) {
    await hit('users', 'GET', `/users/${userId}`, { token: userToken });
  } else {
    results.push({ module: 'users', method: 'GET', path: '/users/:id', status: 'skip', ok: false, note: 'no user id from register' });
  }

  // Report
  const pad = (s, n) => String(s).padEnd(n);
  console.log(`\nSmoke test against ${BASE}\n`);
  console.log(`${pad('MODULE', 12)} ${pad('METHOD', 7)} ${pad('STATUS', 7)} PATH`);
  for (const r of results) {
    const mark = r.ok ? '✓' : '✗';
    console.log(`${mark} ${pad(r.module, 10)} ${pad(r.method, 7)} ${pad(r.status, 7)} ${r.path}${r.note ? '  — ' + r.note : ''}`);
  }
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
  if (failed.length) {
    console.error(`FAILED: ${failed.map((f) => f.module + ' ' + f.path).join(', ')}`);
    process.exit(1);
  }
  console.log('All endpoints returned 2xx.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
