import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';

export interface GoogleProfile {
  /** Google's stable per-account subject id — the value we key `User.googleId` on. */
  sub: string;
  email: string;
  emailVerified: boolean;
  name?: string;
}

/**
 * Verifies Google Identity Services ID tokens (the client-side "Sign in with
 * Google" button/One Tap flow) — not the server-side redirect/authorization-code
 * flow, so only GOOGLE_CLIENT_ID is needed here (no client secret, no callback
 * route: the frontend and API are on different origins/domains, so a
 * redirect-based flow would need a cross-domain cookie hop this avoids).
 *
 * Unlike EmailService/GeminiService's "stub when unconfigured" pattern, this
 * can't degrade gracefully — silently accepting unverifiable tokens would be
 * a real auth bypass, so a missing client ID is a hard failure, not a stub.
 */
@Injectable()
export class GoogleAuthService {
  private client: OAuth2Client | null = null;

  get enabled(): boolean {
    return Boolean(process.env.GOOGLE_CLIENT_ID);
  }

  private getClient(): OAuth2Client {
    if (!this.client) {
      if (!process.env.GOOGLE_CLIENT_ID) {
        throw new InternalServerErrorException('Google sign-in is not configured');
      }
      this.client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    }
    return this.client;
  }

  async verifyIdToken(idToken: string): Promise<GoogleProfile> {
    let ticket;
    try {
      ticket = await this.getClient().verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    } catch {
      throw new UnauthorizedException('Invalid Google sign-in token');
    }

    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email) {
      throw new UnauthorizedException('Google account has no verifiable email');
    }

    return {
      sub: payload.sub,
      email: payload.email,
      emailVerified: payload.email_verified ?? false,
      name: payload.name,
    };
  }
}
