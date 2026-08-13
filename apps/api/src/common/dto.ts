/**
 * OpenAPI DTO classes generated from the shared Zod schemas (nestjs-zod).
 * Used as `@Body()` parameter types so `@nestjs/swagger` (patched by
 * `patchNestJsSwagger()`) can render request schemas at /api/v1/docs. Runtime
 * validation still runs through the per-route ZodValidationPipe.
 */
import { createZodDto } from 'nestjs-zod';
import {
  adminLoginSchema,
  userRegisterSchema,
  userLoginSchema,
  refreshTokenSchema,
  createQuestionSchema,
  updateQuestionSchema,
  createAnswerSchema,
  updateAnswerSchema,
  aiGenerateAnswerSchema,
  createRemedySchema,
  updateRemedySchema,
  chartConfigSchema,
  autoTranslateSchema,
  submitResponsesSchema,
} from '@silence/shared';

export class AdminLoginDto extends createZodDto(adminLoginSchema) {}
export class UserRegisterDto extends createZodDto(userRegisterSchema) {}
export class UserLoginDto extends createZodDto(userLoginSchema) {}
export class RefreshTokenDto extends createZodDto(refreshTokenSchema) {}
export class CreateQuestionDto extends createZodDto(createQuestionSchema) {}
export class UpdateQuestionDto extends createZodDto(updateQuestionSchema) {}
export class CreateAnswerDto extends createZodDto(createAnswerSchema) {}
export class UpdateAnswerDto extends createZodDto(updateAnswerSchema) {}
export class AiGenerateAnswerDto extends createZodDto(aiGenerateAnswerSchema) {}
export class CreateRemedyDto extends createZodDto(createRemedySchema) {}
export class UpdateRemedyDto extends createZodDto(updateRemedySchema) {}
export class ChartConfigDto extends createZodDto(chartConfigSchema) {}
export class AutoTranslateDto extends createZodDto(autoTranslateSchema) {}
export class SubmitResponsesDto extends createZodDto(submitResponsesSchema) {}
