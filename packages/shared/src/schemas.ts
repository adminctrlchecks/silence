/**
 * Zod schemas for the request/response shapes in docs/API.md.
 * These are the single source of truth for validation: the NestJS API uses
 * them in DTOs, and the Next.js web app uses them for form validation.
 */
import { z } from 'zod';
import { CATEGORIES, LEVELS, ANSWER_SOURCES, CHART_STYLES, IMPORT_TYPES } from './enums';
import { LANGUAGE_CODES } from './languages';

export const categorySchema = z.enum(CATEGORIES);
export const levelSchema = z.enum(LEVELS);
export const answerSourceSchema = z.enum(ANSWER_SOURCES);
export const chartStyleSchema = z.enum(CHART_STYLES);
export const importTypeSchema = z.enum(IMPORT_TYPES);
export const langSchema = z.string().refine((c) => LANGUAGE_CODES.includes(c), {
  message: 'Unsupported language code',
});

/** A map of { langCode: text } used on every translatable content item. */
export const translationsSchema = z.record(z.string(), z.string());

// ── Auth ────────────────────────────────────────────────────────────────────
export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const placeOfBirthSchema = z.object({
  city: z.string().min(1),
  country: z.string().min(1), // ISO country code or name
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export const userRegisterSchema = z.object({
  name: z.string().min(1),
  category: categorySchema,
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD'),
  timeOfBirth: z.string().regex(/^\d{2}:\d{2}$/, 'Expected HH:MM'),
  placeOfBirth: placeOfBirthSchema,
  contact: z.string().min(1), // phone or email
  password: z.string().min(8, 'Password must be at least 8 characters'), // decision D: email/phone + password
  lang: langSchema.default('en'),
  consent: z.literal(true, { errorMap: () => ({ message: 'Consent is required' }) }),
});

export const userLoginSchema = z.object({
  contact: z.string().min(1),
  password: z.string().min(1),
});

/** Exchange a refresh token for a fresh access token (admin or user). */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

// ── Questions ─────────────────────────────────────────────────────────────
export const createQuestionSchema = z.object({
  level: levelSchema,
  category: categorySchema,
  text: z.string().min(1),
  order: z.number().int().nonnegative().optional(),
  translations: translationsSchema.optional(),
});
export const updateQuestionSchema = createQuestionSchema.partial();

// ── Answers ────────────────────────────────────────────────────────────────
export const createAnswerSchema = z.object({
  questionId: z.string().min(1),
  level: levelSchema,
  category: categorySchema,
  text: z.string().min(1),
  source: answerSourceSchema.default('admin'),
  translations: translationsSchema.optional(),
});
export const updateAnswerSchema = createAnswerSchema.partial();

export const aiGenerateAnswerSchema = z.object({
  questionId: z.string().min(1),
  level: levelSchema,
  category: categorySchema,
  lang: langSchema.default('en'),
});

// ── Remedies ────────────────────────────────────────────────────────────────
export const createRemedySchema = z.object({
  category: categorySchema,
  title: z.string().min(1),
  text: z.string().min(1),
  linkedTo: z
    .object({ level: levelSchema, questionId: z.string().min(1) })
    .optional(),
  translations: translationsSchema.optional(),
});
export const updateRemedySchema = createRemedySchema.partial();

// ── Chart config ─────────────────────────────────────────────────────────────
export const chartConfigSchema = z.object({
  category: categorySchema,
  type: z.literal('astrology').default('astrology'),
  style: chartStyleSchema,
  source: z.literal('level2').default('level2'),
  requires: z.array(z.string()).default(['dob', 'timeOfBirth', 'placeOfBirth']),
});

// ── Translations ─────────────────────────────────────────────────────────────
export const autoTranslateSchema = z.object({
  entity: z.enum(['question', 'answer', 'remedy']),
  id: z.string().min(1),
  targets: z.array(langSchema).min(1),
});

// ── User flow ────────────────────────────────────────────────────────────────
export const submitResponsesSchema = z.object({
  userId: z.string().min(1),
  level: levelSchema,
  category: categorySchema,
  answers: z
    .array(z.object({ questionId: z.string().min(1), value: z.string() }))
    .min(1),
});

// ── Inferred request types ───────────────────────────────────────────────────
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type UserRegisterInput = z.infer<typeof userRegisterSchema>;
export type UserLoginInput = z.infer<typeof userLoginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
export type CreateAnswerInput = z.infer<typeof createAnswerSchema>;
export type UpdateAnswerInput = z.infer<typeof updateAnswerSchema>;
export type AiGenerateAnswerInput = z.infer<typeof aiGenerateAnswerSchema>;
export type CreateRemedyInput = z.infer<typeof createRemedySchema>;
export type UpdateRemedyInput = z.infer<typeof updateRemedySchema>;
export type ChartConfigInput = z.infer<typeof chartConfigSchema>;
export type AutoTranslateInput = z.infer<typeof autoTranslateSchema>;
export type SubmitResponsesInput = z.infer<typeof submitResponsesSchema>;
export type PlaceOfBirth = z.infer<typeof placeOfBirthSchema>;
