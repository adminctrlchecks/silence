/**
 * Language handling for the web app. The canonical list of 11 starting
 * languages (with RTL flags) lives in @silence/shared so the whole stack agrees.
 */
import { LANGUAGES, DEFAULT_LANGUAGE, isRtl, type LanguageDef } from '@silence/shared';

export { LANGUAGES, DEFAULT_LANGUAGE, isRtl };
export type { LanguageDef };

export function dirFor(lang: string): 'ltr' | 'rtl' {
  return isRtl(lang) ? 'rtl' : 'ltr';
}
