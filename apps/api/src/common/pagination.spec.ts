import { parsePageParams, paginated, DEFAULT_LIMIT, MAX_LIMIT } from './pagination';

describe('parsePageParams', () => {
  it('applies defaults when nothing is provided', () => {
    expect(parsePageParams()).toEqual({ page: 1, limit: DEFAULT_LIMIT, skip: 0, take: DEFAULT_LIMIT });
  });

  it('computes skip/take from page and limit', () => {
    expect(parsePageParams(3, 10)).toEqual({ page: 3, limit: 10, skip: 20, take: 10 });
  });

  it('parses string query values', () => {
    expect(parsePageParams('2', '15')).toEqual({ page: 2, limit: 15, skip: 15, take: 15 });
  });

  it('clamps limit to MAX_LIMIT and floors page/limit at 1', () => {
    expect(parsePageParams(0, 9999).limit).toBe(MAX_LIMIT);
    expect(parsePageParams(-5, -1).page).toBe(1);
    expect(parsePageParams(-5, -1).limit).toBe(1); // negative limit clamps up to 1
  });

  it('falls back to defaults for non-numeric input', () => {
    expect(parsePageParams('abc', 'xyz')).toEqual({
      page: 1,
      limit: DEFAULT_LIMIT,
      skip: 0,
      take: DEFAULT_LIMIT,
    });
  });
});

describe('paginated', () => {
  it('wraps rows in the standard envelope', () => {
    expect(paginated([1, 2], 2, 20, 42)).toEqual({ data: [1, 2], page: 2, limit: 20, total: 42 });
  });
});
