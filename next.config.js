/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["firebase-admin"],
    outputFileTracingIncludes: {
      "/api/passes/[cardId]": ["./src/lib/passkit/assets/**/*"],
      "/api/public/cards/[slug]/pass": ["./src/lib/passkit/assets/**/*"],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
