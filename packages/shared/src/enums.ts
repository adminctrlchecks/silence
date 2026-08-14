/**
 * Core enums shared across the Silence API contract.
 * Mirrors the "Conventions › Enums" section of docs/API.md.
 */

export const CATEGORIES = ['male', 'female', 'other'] as const;
export type Category = (typeof CATEGORIES)[number];

export const LEVELS = ['common', 'level1', 'level2'] as const;
export type Level = (typeof LEVELS)[number];

/** Where an answer came from. AI answers are saved for admin review. */
export const ANSWER_SOURCES = ['admin', 'ai'] as const;
export type AnswerSource = (typeof ANSWER_SOURCES)[number];

/** Astrology chart styles the admin can configure per category. */
export const CHART_STYLES = ['north-indian', 'south-indian', 'western'] as const;
export type ChartStyle = (typeof CHART_STYLES)[number];

/** Excel import job types (Import Mode). */
export const IMPORT_TYPES = [
  'questions',
  'answers-level1',
  'answers-level2',
  'remedies',
] as const;
export type ImportType = (typeof IMPORT_TYPES)[number];

export const IMPORT_STATUSES = ['processing', 'done', 'failed'] as const;
export type ImportStatus = (typeof IMPORT_STATUSES)[number];

/** Funnel stage of a reading session — draft → in_progress → chart_ready → remedy_ready → complete. */
export const READING_SESSION_STATUSES = [
  'draft',
  'in_progress',
  'chart_ready',
  'remedy_ready',
  'complete',
] as const;
export type ReadingSessionStatus = (typeof READING_SESSION_STATUSES)[number];

/** What the dashboard should point the user at next. */
export const NEXT_STEPS = [
  'start_reading',
  'continue_questions',
  'view_chart',
  'view_remedy',
  'view_history',
] as const;
export type NextStep = (typeof NEXT_STEPS)[number];
