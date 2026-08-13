/**
 * The 11 starting languages (docs/REQUIREMENTS.md §6).
 * More can be added later via POST /admin/languages with no code change,
 * so treat this as the *seed* set, not a hard-coded ceiling.
 */

export interface LanguageDef {
  code: string;
  /** English name. */
  name: string;
  /** Endonym (name in its own language) — handy for the language picker. */
  nativeName: string;
  /** Text direction. Arabic is RTL; the UI must support it. */
  dir: 'ltr' | 'rtl';
}

export const LANGUAGES: readonly LanguageDef[] = [
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr' },
  { code: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文', dir: 'ltr' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl' },
  { code: 'fr', name: 'French', nativeName: 'Français', dir: 'ltr' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', dir: 'ltr' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', dir: 'ltr' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', dir: 'ltr' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', dir: 'ltr' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', dir: 'ltr' },
] as const;

export const LANGUAGE_CODES = LANGUAGES.map((l) => l.code);
export const DEFAULT_LANGUAGE = 'en';

export function isRtl(code: string): boolean {
  return LANGUAGES.find((l) => l.code === code)?.dir === 'rtl';
}

export function getLanguage(code: string): LanguageDef | undefined {
  return LANGUAGES.find((l) => l.code === code);
}
