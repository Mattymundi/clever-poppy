import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: [
    "@prisma/adapter-libsql",
    "@libsql/client",
  ],
};

export default nextConfig;
