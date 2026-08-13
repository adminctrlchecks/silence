/**
 * Typed API client for the Silence NestJS backend.
 * All types come from @silence/shared so the web app and API never drift.
 */
import type {
  Paginated,
  Question,
  Answer,
  Remedy,
  UserChart,
  UserHistory,
  UserProfile,
  ImportJob,
  Category,
  Level,
} from '@silence/shared';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.API_BASE_URL ??
  'http://localhost:3010/api/v1';

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

type Query = Record<string, string | number | boolean | undefined>;

function toQuery(params?: Query): string {
  if (!params) return '';
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : '';
}

async function request<T>(
  path: string,
  opts: { method?: string; body?: unknown; token?: string; query?: Query } = {},
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}${toQuery(opts.query)}`, {
    method: opts.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    cache: 'no-store',
  });

  if (!res.ok) {
    let code = 'ERROR';
    let message = res.statusText;
    try {
      const data = await res.json();
      code = data?.error?.code ?? code;
      message = data?.error?.message ?? message;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(res.status, code, message);
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

/** Public (user-facing) endpoints — docs/API.md §8–10. */
export const publicApi = {
  languages: () => request<{ data: { code: string; name: string; rtl: boolean }[] }>('/languages'),
  questions: (q: { level?: Level; category?: Category; lang?: string }) =>
    request<Paginated<Question>>('/questions', { query: q }),
  submitResponses: (body: unknown, token: string) =>
    request<{ saved: number }>('/responses', { method: 'POST', body, token }),
  answer: (q: { questionId: string; level: Level; category: Category; lang?: string }) =>
    request<Answer>('/answers', { query: q }),
  chart: (userId: string, lang: string, token: string) =>
    request<UserChart>(`/users/${userId}/chart`, { query: { lang }, token }),
  remedy: (userId: string, lang: string, token: string) =>
    request<Remedy>(`/users/${userId}/remedy`, { query: { lang }, token }),
  profile: (userId: string, token: string) => request<UserProfile>(`/users/${userId}`, { token }),
  history: (userId: string, lang: string, token: string) =>
    request<UserHistory>(`/users/${userId}/history`, { query: { lang }, token }),
};

/** Auth endpoints — docs/API.md §1. */
export const authApi = {
  adminLogin: (body: { email: string; password: string }) =>
    request<{ token: string; refreshToken: string; admin: { id: string; name: string } }>('/auth/admin/login', {
      method: 'POST',
      body,
    }),
  userRegister: (body: unknown) =>
    request<{ token: string; refreshToken: string; user: { id: string; name: string; category: Category } }>(
      '/auth/user/register',
      { method: 'POST', body },
    ),
  userLogin: (body: unknown) =>
    request<{ token: string; refreshToken: string; user: { id: string; name: string; category: Category } }>(
      '/auth/user/login',
      { method: 'POST', body },
    ),
};

/** Admin endpoints — docs/API.md §2–7 (all require an admin token). */
export const adminApi = {
  listQuestions: (token: string, q: Query) =>
    request<Paginated<Question>>('/admin/questions', { token, query: q }),
  getQuestion: (token: string, id: string, q: Query = {}) =>
    request<Question>(`/admin/questions/${id}`, { token, query: q }),
  createQuestion: (token: string, body: unknown) =>
    request<Question>('/admin/questions', { method: 'POST', token, body }),
  updateQuestion: (token: string, id: string, body: unknown) =>
    request<Question>(`/admin/questions/${id}`, { method: 'PUT', token, body }),
  deleteQuestion: (token: string, id: string) =>
    request<{ deleted: boolean }>(`/admin/questions/${id}`, { method: 'DELETE', token }),
  listAnswers: (token: string, q: Query) =>
    request<{ data: Answer[] }>('/admin/answers', { token, query: q }),
  aiGenerate: (token: string, body: unknown) =>
    request<Answer>('/admin/answers/ai-generate', { method: 'POST', token, body }),
  listRemedies: (token: string, q: Query) =>
    request<{ data: Remedy[] }>('/admin/remedies', { token, query: q }),
  importStatus: (token: string, jobId: string) =>
    request<ImportJob>(`/admin/import/${jobId}`, { token }),
};
