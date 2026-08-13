/**
 * Response/entity types returned by the API (docs/API.md §11 data model).
 * Request/input types live in schemas.ts (inferred from Zod).
 */
import type { Category, Level, AnswerSource, ChartStyle, ImportStatus, ImportType } from './enums';

export interface Translated {
  /** { langCode: text } — resolved server-side for the requested ?lang. */
  translations?: Record<string, string>;
}

/** Standard list envelope for every paginated endpoint (docs/API.md §0). */
export interface Paginated<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}

/** Standard error envelope (docs/API.md §0). */
export interface ApiError {
  error: { code: string; message: string };
}

export interface Question extends Translated {
  id: string;
  level: Level;
  category: Category;
  text: string;
  order: number;
}

export interface Answer extends Translated {
  id: string;
  questionId: string;
  level: Level;
  category: Category;
  text: string;
  source: AnswerSource;
  /** AI answers stay unreviewed until an admin approves them. */
  reviewed: boolean;
}

export interface Remedy extends Translated {
  id: string;
  category: Category;
  title: string;
  text: string;
  linkedLevel?: Level;
  linkedQuestionId?: string;
}

export interface ChartConfig {
  category: Category;
  type: 'astrology';
  style: ChartStyle;
  source: 'level2';
  requires: string[];
}

/** Computed astrology chart returned to the user (geometry + interpretation). */
export interface UserChart {
  userId: string;
  category: Category;
  type: 'astrology';
  style: ChartStyle;
  /** Planetary placements / house data produced by the ephemeris engine. */
  data: unknown;
  /** Gemini-written interpretation text, in the requested language. */
  interpretation?: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  category: Category;
  dob: string;
  timeOfBirth: string;
  placeOfBirth: { city: string; country: string; lat?: number; lng?: number };
  contact: string;
  lang: string;
  consent: boolean;
}

export interface ImportJob {
  jobId: string;
  type: ImportType;
  status: ImportStatus;
  created?: number;
  updated?: number;
  errors?: Array<{ row: number; message: string }>;
}

// ── API envelopes ────────────────────────────────────────────────────────────
export interface ApiError {
  error: { code: string; message: string };
}

export interface Paginated<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}

export interface AuthResponse<T> {
  token: string;
  admin?: T;
  user?: T;
}
