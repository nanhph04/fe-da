import type { NextConfig } from "next";

const apiGatewayUrl =
  process.env.NEXT_PUBLIC_GATEWAY_URL ??
  "http://localhost:4000";

const appHostIp = process.env.NEXT_PUBLIC_APP_HOST_IP;

const avatarStorageUrl =
  process.env.NEXT_PUBLIC_AVATAR_STORAGE_URL ??
  "http://localhost:9000";
const avatarStorageRemotePattern = new URL(avatarStorageUrl);
const avatarStorageLanRemotePattern = appHostIp
  ? new URL(`http://${appHostIp}:9000`)
  : null;

const nextConfig: NextConfig = {
  cacheComponents: true,

  allowedDevOrigins: appHostIp ? [appHostIp] : [],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: avatarStorageRemotePattern.protocol.replace(":", "") as
          | "http"
          | "https",
        hostname: avatarStorageRemotePattern.hostname,
        port: avatarStorageRemotePattern.port,
        pathname: "/identity-avatars/**",
      },
      ...(avatarStorageLanRemotePattern
        ? [
            {
              protocol: avatarStorageLanRemotePattern.protocol.replace(
                ":",
                "",
              ) as "http" | "https",
              hostname: avatarStorageLanRemotePattern.hostname,
              port: avatarStorageLanRemotePattern.port,
              pathname: "/identity-avatars/**",
            },
          ]
        : []),
    ],
  },

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