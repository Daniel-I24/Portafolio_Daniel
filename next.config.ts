import type { NextConfig } from "next";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host
  : "";
const isDev = process.env.NODE_ENV !== "production";
// Vercel's preview toolbar (comments, feedback) loads from vercel.live; production keeps the strict policy.
// Sources follow Vercel's documented CSP for the toolbar.
const preview = process.env.VERCEL_ENV === "preview";
const live = preview ? " https://vercel.live" : "";
const liveSocket = preview ? " wss://ws-us3.pusher.com" : "";
const liveAssets = preview ? " https://vercel.live https://vercel.com https://assets.vercel.com" : "";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}${live}`,
  `style-src 'self' 'unsafe-inline'${live}`,
  `img-src 'self' data: blob: https://avatars.githubusercontent.com ${supabaseHost && `https://${supabaseHost}`}${liveAssets}`,
  `font-src 'self'${liveAssets}`,
  `connect-src 'self' ${supabaseHost && `https://${supabaseHost} wss://${supabaseHost}`}${live}${liveSocket}`,
  `frame-src ${live ? live.trim() : "'none'"}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  // The admin login form redirects to Supabase Auth and then to GitHub OAuth.
  `form-action 'self' https://github.com ${supabaseHost && `https://${supabaseHost}`}`,
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 90],
    // Hero photo: 1x/2x of its three display widths (208, 288, 440 px), capped by the 1002 px file (never enlarged).
    imageSizes: [16, 32, 48, 64, 96, 128, 208, 256, 288, 384, 416, 576],
    deviceSizes: [640, 750, 828, 880, 1002, 1200, 1920, 2048, 3840],
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
  // The browserslist targets (package.json) already ship Array.prototype.at, flat, Object.hasOwn, etc.:
  // Next's always-on client polyfill module is swapped for nothing so it no longer counts as legacy JS.
  webpack(config, { isServer }) {
    if (!isServer) {
      config.resolve.alias = { ...config.resolve.alias, [require.resolve("next/dist/build/polyfills/polyfill-module")]: false };
    }
    return config;
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
