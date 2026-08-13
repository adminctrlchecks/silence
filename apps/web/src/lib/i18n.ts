/**
 * Language handling for the web app. The canonical list of 11 starting
 * languages (with RTL flags) lives in @silence/shared so the whole stack agrees.
 */
import { LANGUAGES, DEFAULT_LANGUAGE, LANGUAGE_CODES, isRtl, type LanguageDef } from '@silence/shared';

export { LANGUAGES, DEFAULT_LANGUAGE, LANGUAGE_CODES, isRtl };
export type { LanguageDef };

export function normalizeLanguage(lang?: string | null): string {
  return lang && LANGUAGE_CODES.includes(lang) ? lang : DEFAULT_LANGUAGE;
}

export function dirFor(lang: string): 'ltr' | 'rtl' {
  return isRtl(lang) ? 'rtl' : 'ltr';
}
