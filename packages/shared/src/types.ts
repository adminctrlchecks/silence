/**
 * Response/entity types returned by the API (docs/API.md §11 data model).
 * Request/input types live in schemas.ts (inferred from Zod).
 */
import type {
  Category,
  Level,
  AnswerSource,
  ChartStyle,
  ImportStatus,
  ImportType,
  ReadingSessionStatus,
  NextStep,
} from './enums';

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
  inputType: string;
  required: boolean;
  helpText?: string | null;
  active: boolean;
  branchingTags?: string | null;
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

export interface SavedUserResponse {
  id: string;
  userId: string;
  questionId: string;
  level: Level;
  category: Category;
  value: string;
  answerId?: string | null;
  answerTextShown?: string | null;
  createdAt: string;
}

export interface SavedUserChart {
  id: string;
  userId: string;
  category: Category;
  type: string;
  style: string;
  data: unknown;
  interpretation?: string | null;
  createdAt: string;
}

export interface UserHistory {
  userId: string;
  category?: Category;
  lang?: string;
  responses: SavedUserResponse[];
  charts: SavedUserChart[];
}

// ── Reading sessions ─────────────────────────────────────────────────────────

export interface SavedRemedyResult {
  id: string;
  remedyId?: string;
  title: string;
  text: string;
  source: string;
  createdAt: string;
}

export interface QuestionLevelProgress {
  answered: number;
  total: number;
}

/** Answered/total question counts per level, for the active session's category+lang. */
export type QuestionProgress = Record<Level, QuestionLevelProgress>;

export interface ReadingSessionSummary {
  id: string;
  status: ReadingSessionStatus;
  category: Category;
  lang: string;
  startedAt: string;
  completedAt?: string | null;
  updatedAt: string;
  questionProgress: QuestionProgress;
  hasChart: boolean;
  hasRemedy: boolean;
}

export interface ReadingSessionDetail extends ReadingSessionSummary {
  responses: SavedUserResponse[];
  chart?: SavedUserChart | null;
  remedy?: SavedRemedyResult | null;
}

export interface ProfileCompleteness {
  /** 0-100 */
  percent: number;
  missingFields: string[];
}

/** Everything `/app` needs to render a guided dashboard in one call. */
export interface DashboardSummary {
  profile: ProfileCompleteness;
  activeSession: ReadingSessionSummary | null;
  nextStep: NextStep;
  totalSessions: number;
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
