import { Injectable, Logger } from '@nestjs/common';

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Thin outbound email abstraction (Phase 6 — password reset emails).
 *
 * When `RESEND_API_KEY` is set it sends via the Resend HTTP API (a single
 * `fetch` call — no SDK dependency needed); otherwise it logs the email
 * instead of sending, so local dev/CI and any environment without a mail
 * provider configured still work end-to-end (the reset link is right there
 * in the server log). The provider is hidden behind this service so it can
 * be swapped without touching callers — mirrors GeminiService's pattern.
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  get enabled(): boolean {
    return Boolean(process.env.RESEND_API_KEY);
  }

  get provider(): 'resend' | 'stub' {
    return this.enabled ? 'resend' : 'stub';
  }

  async send(params: SendEmailParams): Promise<void> {
    if (!this.enabled) {
      this.logger.warn(
        `RESEND_API_KEY not set — logging email instead of sending.\nTo: ${params.to}\nSubject: ${params.subject}\n${params.text}`,
      );
      return;
    }

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM ?? 'Silence <onboarding@resend.dev>',
          to: params.to,
          subject: params.subject,
          html: params.html,
          text: params.text,
        }),
      });
      if (!res.ok) {
        this.logger.error(`Resend send failed (${res.status}): ${await res.text().catch(() => '')}`);
      }
    } catch (err) {
      // Never let an email-provider outage break the request that triggered it.
      this.logger.error(`Email send failed: ${String(err)}`);
    }
  }

  async sendPasswordReset(params: { to: string; resetUrl: string; role: 'admin' | 'user' }): Promise<void> {
    const subject = 'Reset your Silence password';
    const text =
      `We received a request to reset your Silence ${params.role} password.\n\n` +
      `Reset it here (valid for 1 hour): ${params.resetUrl}\n\n` +
      `If you didn't request this, you can safely ignore this email.`;
    const html =
      `<p>We received a request to reset your Silence ${params.role} password.</p>` +
      `<p><a href="${params.resetUrl}">Reset your password</a> (valid for 1 hour).</p>` +
      `<p>If you didn't request this, you can safely ignore this email.</p>`;
    await this.send({ to: params.to, subject, html, text });
  }
}
