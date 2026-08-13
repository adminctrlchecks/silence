import { CATEGORIES, type Category } from '@silence/shared';
import { normalizeLanguage } from '@/lib/i18n';

export const LANGUAGE_COOKIE = 'silence_lang';
export const CATEGORY_COOKIE = 'silence_category';
export const DEFAULT_CATEGORY: Category = 'other';

export const CATEGORY_LABELS: Record<Category, string> = {
  male: 'Male',
  female: 'Female',
  other: 'Other',
};

export function normalizeSessionLanguage(lang?: string | null) {
  return normalizeLanguage(lang);
}

export function normalizeCategory(category?: string | null): Category | null {
  return CATEGORIES.includes(category as Category) ? (category as Category) : null;
}

export function categoryOrDefault(category?: string | null): Category {
  return normalizeCategory(category) ?? DEFAULT_CATEGORY;
}
