import { join } from 'node:path';
import createNextIntlPlugin from 'next-intl/plugin';

// Standalone output is for the VPS/systemd deploy (Phase 10-11). On Vercel it is
// unnecessary and its monorepo file-tracing conflicts with Vercel's own build,
// so disable it there (Vercel sets VERCEL=1).
const onVercel = Boolean(process.env.VERCEL);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  ...(onVercel
    ? {}
    : {
        output: 'standalone',
        // Trace/copy files from the repo root into the standalone bundle.
        outputFileTracingRoot: join(import.meta.dirname, '../../'),
      }),
  // @silence/shared ships raw TS — let Next transpile it from the workspace.
  transpilePackages: ['@silence/shared'],
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
