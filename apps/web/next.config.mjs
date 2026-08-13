/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // @silence/shared ships raw TS — let Next transpile it from the workspace.
  transpilePackages: ['@silence/shared'],
};

export default nextConfig;
