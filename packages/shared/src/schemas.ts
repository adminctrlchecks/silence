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
  timezone: z.string().optional(),
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

/**
 * Google Sign-In: the frontend verifies the user via Google Identity Services
 * client-side (renderButton/One Tap) and forwards the resulting ID token here.
 * The API verifies the token's signature/audience itself — never trust the
 * client for identity, only for delivering the token.
 */
export const googleAuthSchema = z.object({
  idToken: z.string().min(1),
  lang: langSchema.optional(),
});

/** Exchange a refresh token for a fresh access token (admin or user). */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New passwords do not match',
    path: ['confirmPassword'],
  });

// ── Forgot / reset password (Phase 6) ─────────────────────────────────────────
// Forgot-password requests always resolve the same way regardless of whether
// the contact/email exists, so the schema is deliberately minimal.
export const userForgotPasswordSchema = z.object({
  contact: z.string().min(1),
});
export const adminForgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New passwords do not match',
    path: ['confirmPassword'],
  });

// ── Questions ─────────────────────────────────────────────────────────────
export const createQuestionSchema = z.object({
  level: levelSchema,
  category: categorySchema,
  text: z.string().min(1),
  inputType: z.string().default('textarea').optional(),
  required: z.boolean().default(true).optional(),
  helpText: z.string().optional(),
  active: z.boolean().default(true).optional(),
  branchingTags: z.string().optional(),
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
export const reviewAnswerSchema = z.object({
  reviewed: z.boolean(),
});
export const updateAnswerSchema = createAnswerSchema.extend({ reviewed: z.boolean().optional() }).partial();

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
  // Rule fields — see RemediesService.selectRemedy. All optional and AND-combined.
  // Nullable so the admin UI can explicitly clear a previously-set filter on update.
  priority: z.number().int().default(0).optional(),
  enabled: z.boolean().default(true).optional(),
  planetFilter: z.string().nullable().optional(),
  signFilter: z.string().nullable().optional(),
  houseFilter: z.string().nullable().optional(),
  keywordFilter: z.string().nullable().optional(),
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
  // Optional: ties these responses to a ReadingSession. Omitted by older callers.
  sessionId: z.string().min(1).optional(),
  level: levelSchema,
  category: categorySchema,
  answers: z
    .array(z.object({ questionId: z.string().min(1), value: z.string() }))
    .min(1),
});

export const updateUserProfileSchema = z.object({
  name: z.string().min(1).optional(),
  category: categorySchema.optional(),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD').optional(),
  timeOfBirth: z.string().regex(/^\d{2}:\d{2}$/, 'Expected HH:MM').optional(),
  placeOfBirth: placeOfBirthSchema.optional(),
  lang: langSchema.optional(),
  // Only ever moves false -> true here (e.g. completing a Google sign-up
  // profile). Consent withdrawal is a support/privacy-request path, not a
  // field a generic profile PATCH can flip off.
  consent: z.literal(true).optional(),
});

// ── Inferred request types ───────────────────────────────────────────────────
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type UserRegisterInput = z.infer<typeof userRegisterSchema>;
export type UserLoginInput = z.infer<typeof userLoginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UserForgotPasswordInput = z.infer<typeof userForgotPasswordSchema>;
export type AdminForgotPasswordInput = z.infer<typeof adminForgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
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
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
export type PlaceOfBirth = z.infer<typeof placeOfBirthSchema>;
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;
