/* eslint-disable @typescript-eslint/no-explicit-any */
const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 's.gravatar.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.auth0.com',
      },
      {
        protocol: 'https',
        hostname: 'i0.wp.com',
      }
    ],
    dangerouslyAllowSVG: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb', // Match our file upload limit check
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        child_process: false,
        "mongodb-client-encryption": false,
        "aws-crt": false,
        "dns": false,
        "timers": false,
        "timers/promises": false,
        "async_hooks": false,
      };
    }
    return config;
  },
};

export default withPWA(nextConfig);
