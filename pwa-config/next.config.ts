import type { NextConfig } from "next";
// npm install next-pwa  (+ @types/next-pwa si usa TS estricto)
import withPWA from "next-pwa";

const pwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    {
      // Cache-first para assets estáticos
      urlPattern: /^https:\/\/.*\.(png|jpg|jpeg|svg|ico|woff2?)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "static-assets",
        expiration: { maxEntries: 64, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
    {
      // Network-first para API calls (punches, auth)
      urlPattern: /^https:\/\/api\.gotest\.app\/v1\/.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "api-cache",
        expiration: { maxEntries: 32, maxAgeSeconds: 5 * 60 },
        networkTimeoutSeconds: 10,
      },
    },
    {
      // Stale-while-revalidate para /sites (cambia poco)
      urlPattern: /^https:\/\/api\.gotest\.app\/v1\/sites.*/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "sites-cache",
        expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 },
      },
    },
  ],
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Headers de seguridad
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            // Geolocation requerido para geofence; publickey-credentials para WebAuthn
            value: "geolocation=(), publickey-credentials-get=(self)",
          },
        ],
      },
    ];
  },
};

export default pwaConfig(nextConfig);
