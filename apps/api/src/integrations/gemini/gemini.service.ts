import { Injectable, Logger } from '@nestjs/common';
import type { GenerativeModel } from '@google/generative-ai';
import type { Category, Level } from '@silence/shared';

/**
 * Thin wrapper around the Gemini API. Two jobs (docs/API.md §12):
 *   1. AI-Mode fallback answers when the admin hasn't written one.
 *   2. Translation of content across the enabled languages.
 *
 * When `GEMINI_API_KEY` is set it calls the real `@google/generative-ai` model;
 * otherwise it returns deterministic placeholder text so the rest of the app
 * (and local dev / CI) works without a key. The provider is hidden behind this
 * service, so it can be swapped without touching controllers.
 */
@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private model?: GenerativeModel;
  private modelInitFailed = false;

  /** Whether a real key is configured. */
  get enabled(): boolean {
    return Boolean(process.env.GEMINI_API_KEY);
  }

  /** Which backend a call will use — handy for API responses / logging. */
  get provider(): 'gemini' | 'stub' {
    return this.enabled ? 'gemini' : 'stub';
  }

  async generateAnswer(params: {
    questionText: string;
    level: Level;
    category: Category;
    lang: string;
  }): Promise<string> {
    const prompt =
      `You are an astrology guidance assistant. Write a concise, helpful ${params.level} answer ` +
      `for the "${params.category}" category, written in the language with code "${params.lang}", ` +
      `to the question: "${params.questionText}". Return only the answer text.`;
    return this.callGemini(prompt);
  }

  async translate(text: string, target: string): Promise<string> {
    if (!text?.trim()) return text;
    return this.callGemini(
      `Translate the text between <t></t> into the language with code "${target}". ` +
        `Preserve meaning and tone. Return only the translation, with no quotes or commentary.\n\n` +
        `<t>${text}</t>`,
    );
  }

  /** Lazily build (and cache) the generative model. Returns undefined if unavailable. */
  private getModel(): GenerativeModel | undefined {
    if (this.model || this.modelInitFailed) return this.model;
    try {
      // Lazy require so the SDK is only loaded when a key is present.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { GoogleGenerativeAI } = require('@google/generative-ai') as typeof import('@google/generative-ai');
      const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
      this.model = client.getGenerativeModel({
        model: process.env.GEMINI_MODEL ?? 'gemini-2.5-flash',
      });
      return this.model;
    } catch (err) {
      this.modelInitFailed = true;
      this.logger.error(`Failed to initialise Gemini client: ${String(err)}`);
      return undefined;
    }
  }

  private stub(prompt: string): string {
    return `[AI placeholder] ${prompt.slice(0, 80)}…`;
  }

  private async callGemini(prompt: string): Promise<string> {
    if (!this.enabled) {
      this.logger.warn('GEMINI_API_KEY not set — returning placeholder text.');
      return this.stub(prompt);
    }
    const model = this.getModel();
    if (!model) return this.stub(prompt);
    try {
      const res = await model.generateContent(prompt);
      const text = res.response.text().trim();
      return text || this.stub(prompt);
    } catch (err) {
      // Never let an upstream outage break the request — fall back to the stub.
      this.logger.error(`Gemini call failed, using placeholder: ${String(err)}`);
      return this.stub(prompt);
    }
  }
}
