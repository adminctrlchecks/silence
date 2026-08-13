import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { zodToOpenAPI } from 'nestjs-zod';
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
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/http-exception.filter';

// Map each generated DTO component name to its source Zod schema so we can fill
// the OpenAPI request-body schemas (nestjs-zod's swagger patch is incompatible
// with @nestjs/swagger v11, so we convert the schemas ourselves).
const DTO_SCHEMAS: Record<string, unknown> = {
  AdminLoginDto: adminLoginSchema,
  UserRegisterDto: userRegisterSchema,
  UserLoginDto: userLoginSchema,
  RefreshTokenDto: refreshTokenSchema,
  CreateQuestionDto: createQuestionSchema,
  UpdateQuestionDto: updateQuestionSchema,
  CreateAnswerDto: createAnswerSchema,
  UpdateAnswerDto: updateAnswerSchema,
  AiGenerateAnswerDto: aiGenerateAnswerSchema,
  CreateRemedyDto: createRemedySchema,
  UpdateRemedyDto: updateRemedySchema,
  ChartConfigDto: chartConfigSchema,
  AutoTranslateDto: autoTranslateSchema,
  SubmitResponsesDto: submitResponsesSchema,
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: false });

  // Every route lives under /api/v1 (docs/API.md).
  app.setGlobalPrefix('api/v1');

  // OpenAPI / Swagger UI at /api/v1/docs (mirrors docs/API.md).
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Silence API')
    .setDescription('Multilingual astrology Q&A API — see docs/API.md.')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'admin')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'user')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  // Fill each DTO component with its real Zod-derived schema.
  document.components = document.components ?? {};
  document.components.schemas = document.components.schemas ?? {};
  for (const [name, schema] of Object.entries(DTO_SCHEMAS)) {
    document.components.schemas[name] = zodToOpenAPI(schema as never) as never;
  }
  SwaggerModule.setup('api/v1/docs', app, document, {
    jsonDocumentUrl: 'api/v1/docs-json',
  });

  const origins = (process.env.WEB_ORIGIN ?? 'http://localhost:3011')
    .split(',')
    .map((o) => o.trim());
  app.enableCors({ origin: origins, credentials: true });

  // Request validation is handled per-route by ZodValidationPipe against the
  // shared Zod schemas — no global class-validator pipe (it would strip the
  // undecorated nestjs-zod DTO bodies).
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = Number(process.env.API_PORT ?? 3010);
  await app.listen(port);
  Logger.log(`Silence API listening on http://localhost:${port}/api/v1`, 'Bootstrap');
}

void bootstrap();
