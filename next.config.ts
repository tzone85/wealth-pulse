import type { NextConfig } from "next";

// This is a private, personal dashboard: search engines are told to stay
// out (X-Robots-Tag + app/robots.ts) and standard security headers are set.
const securityHeaders = [
  { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

// NEXT_OUTPUT=export produces a fully static site in out/ for GitHub Pages
// (see .github/workflows/deploy-pages.yml). headers() only applies when a
// server is present (next start / Vercel), so it is omitted in export mode;
// the robots metadata and robots.txt still ship in the static HTML.
const isStaticExport = process.env.NEXT_OUTPUT === "export";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  ...(isStaticExport
    ? {
        output: "export" as const,
        basePath: process.env.BASE_PATH || "",
        images: { unoptimized: true },
      }
    : {
        async headers() {
          return [
            {
              source: "/:path*",
              headers: securityHeaders,
            },
          ];
        },
      }),
};

export default nextConfig;
