import type { NextConfig } from "next";

const apiGatewayUrl =
  process.env.NEXT_PUBLIC_GATEWAY_URL ??
  "http://localhost:4000";

const nextConfig: NextConfig = {
  cacheComponents: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiGatewayUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
