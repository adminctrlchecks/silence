/**
 * Pagination helpers shared by every list endpoint so they all return the
 * envelope from docs/API.md §0: `{ data, page, limit, total }`.
 */

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

export interface PageParams {
  page: number;
  limit: number;
  skip: number;
  take: number;
}

export interface Paginated<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}

/** Normalise raw `page`/`limit` query values into safe bounds + Prisma skip/take. */
export function parsePageParams(page?: string | number, limit?: string | number): PageParams {
  const p = Math.max(1, Math.floor(Number(page)) || DEFAULT_PAGE);
  const rawLimit = Math.floor(Number(limit)) || DEFAULT_LIMIT;
  const l = Math.min(MAX_LIMIT, Math.max(1, rawLimit));
  return { page: p, limit: l, skip: (p - 1) * l, take: l };
}

/** Wrap a page of rows in the standard list envelope. */
export function paginated<T>(data: T[], page: number, limit: number, total: number): Paginated<T> {
  return { data, page, limit, total };
}
