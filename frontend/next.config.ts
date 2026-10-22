import type { NextConfig } from "next";
import { buildSecurityHeaders } from "./lib/security-headers";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: buildSecurityHeaders({
          isProduction: process.env.NODE_ENV === "production",
          apiUrl: process.env.NEXT_PUBLIC_API_URL,
        }),
      },
    ];
  },
};

export default nextConfig;
