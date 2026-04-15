import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: process.cwd(),
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "nkxssehsjgctvenlevgi.supabase.co",
        port: "",
        pathname: "/storage/**",
      },
    ],
  },
  webpack: (config, { dev }) => {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // File watching is disabled to prevent flickering during agent edits.
    if (dev && process.env.DISABLE_HMR === "true") {
      config.watchOptions = {
        ignored: /.*/,
      }
    }

    return config
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ]
  },
}

export default nextConfig
