/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextConfig } from "next";

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  // ── Fix: exclude dynamic manifests that don't exist as static files ──────
  // Without this, the service worker tries to precache /_next/dynamic-css-manifest.json
  // which doesn't exist as a static file in production, causing the workbox 404 error.
  buildExcludes: [
    /dynamic-css-manifest\.json$/,
    /middleware-manifest\.json$/,
    /server\/.*\.js$/,
  ],
  fallbackToCache: true,
  reloadOnOnline: true,
  cacheOnFrontEndNav: false, // Disable to avoid stale Server Component data
});

const nextConfig: NextConfig = {
  // ── Output & Performance ─────────────────────────────────────────────────
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,

  // ── Image Optimization ───────────────────────────────────────────────────
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 's.gravatar.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'cdn.auth0.com' },
      { protocol: 'https', hostname: 'i0.wp.com' },
    ],
    dangerouslyAllowSVG: true,
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 3600, // Cache optimised images for 1 hour on Vercel
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },

  // ── Cache Headers ────────────────────────────────────────────────────────
  async headers() {
    return [
      // Immutable cache for hashed static assets (JS, CSS, fonts)
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Short cache for pages (revalidated on every deploy via ISR)
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ];
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
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
        "ioredis": false,
      };
    }
    return config;
  },
};

export default withPWA(nextConfig);
