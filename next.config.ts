import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  experimental: { serverActions: { bodySizeLimit: "6mb" } },
  // The CV PDF reads its fonts from disk; public/ is not bundled into serverless functions by default.
  outputFileTracingIncludes: { "/api/cv/[slug]/pdf": ["./public/fonts/**"] },
};

export default withNextIntl(nextConfig);
