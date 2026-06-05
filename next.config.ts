import type { NextConfig } from "next";

const apiGatewayUrl =
  process.env.GATEWAY_INTERNAL_URL ??
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

const mediaStorageUrl =
  process.env.NEXT_PUBLIC_MEDIA_STORAGE_URL ??
  avatarStorageUrl;
const mediaStorageRemotePattern = new URL(mediaStorageUrl);
const mediaStorageLanRemotePattern = appHostIp
  ? new URL(`http://${appHostIp}:9000`)
  : null;
const localMediaStorageRemotePattern = new URL("http://localhost:19000");

import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

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
      {
        protocol: mediaStorageRemotePattern.protocol.replace(":", "") as
          | "http"
          | "https",
        hostname: mediaStorageRemotePattern.hostname,
        port: mediaStorageRemotePattern.port,
        pathname: "/media-processed/**",
      },
      {
        protocol: mediaStorageRemotePattern.protocol.replace(":", "") as
          | "http"
          | "https",
        hostname: mediaStorageRemotePattern.hostname,
        port: mediaStorageRemotePattern.port,
        pathname: "/media-public/**",
      },
      {
        protocol: localMediaStorageRemotePattern.protocol.replace(":", "") as
          | "http"
          | "https",
        hostname: localMediaStorageRemotePattern.hostname,
        port: localMediaStorageRemotePattern.port,
        pathname: "/media-public/**",
      },
      ...(mediaStorageLanRemotePattern
        ? [
            {
              protocol: mediaStorageLanRemotePattern.protocol.replace(
                ":",
                "",
              ) as "http" | "https",
              hostname: mediaStorageLanRemotePattern.hostname,
              port: mediaStorageLanRemotePattern.port,
              pathname: "/media-processed/**",
            },
            {
              protocol: mediaStorageLanRemotePattern.protocol.replace(
                ":",
                "",
              ) as "http" | "https",
              hostname: mediaStorageLanRemotePattern.hostname,
              port: mediaStorageLanRemotePattern.port,
              pathname: "/media-public/**",
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

export default withNextIntl(nextConfig);