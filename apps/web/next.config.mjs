import { join } from 'node:path';
import createNextIntlPlugin from 'next-intl/plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Self-contained server output for the VPS/systemd deploy (Phase 10-11).
  output: 'standalone',
  // In a monorepo, trace/copy files from the repo root into the standalone bundle.
  outputFileTracingRoot: join(import.meta.dirname, '../../'),
  // @silence/shared ships raw TS — let Next transpile it from the workspace.
  transpilePackages: ['@silence/shared'],
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
