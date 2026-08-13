import { Injectable, Logger } from '@nestjs/common';
import type { Category, Level } from '@silence/shared';

/**
 * Thin wrapper around the Gemini API. Two jobs (docs/API.md §12):
 *   1. AI-Mode fallback answers when the admin hasn't written one.
 *   2. Translation of content across the enabled languages.
 *
 * Intentionally a stub: it returns deterministic placeholder text unless a
 * GEMINI_API_KEY is configured. Wire the real `@google/generative-ai` call in
 * `callGemini()` — the rest of the app already depends only on this surface, so
 * the provider can change without touching controllers.
 */
@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);

  private get enabled() {
    return Boolean(process.env.GEMINI_API_KEY);
  }

  async generateAnswer(params: {
    questionText: string;
    level: Level;
    category: Category;
    lang: string;
  }): Promise<string> {
    const prompt =
      `You are an astrology guidance assistant. Write a concise ${params.level} answer ` +
      `for the ${params.category} category, in language "${params.lang}", to the question: ` +
      `"${params.questionText}".`;
    return this.callGemini(prompt);
  }

  async translate(text: string, target: string): Promise<string> {
    return this.callGemini(`Translate the following into "${target}", preserving meaning:\n\n${text}`);
  }

  private async callGemini(prompt: string): Promise<string> {
    if (!this.enabled) {
      this.logger.warn('GEMINI_API_KEY not set — returning placeholder text.');
      return `[AI placeholder] ${prompt.slice(0, 80)}…`;
    }
    // TODO: real call, e.g.
    //   const { GoogleGenerativeAI } = await import('@google/generative-ai');
    //   const model = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    //     .getGenerativeModel({ model: process.env.GEMINI_MODEL ?? 'gemini-1.5-flash' });
    //   const res = await model.generateContent(prompt);
    //   return res.response.text();
    return `[AI placeholder] ${prompt.slice(0, 80)}…`;
  }
}
