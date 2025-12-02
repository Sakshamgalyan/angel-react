import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['smartapi-javascript', 'got', 'keyv', 'public-ip', 'totp-generator'],
};

export default nextConfig;
