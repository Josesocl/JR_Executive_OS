import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Pins Turbopack's workspace root to this project directory so it
    // resolves node_modules from ikigai-planner/ instead of the repo root.
    // Required when Vercel sets Root Directory to a subdirectory of a monorepo.
    root: __dirname,
  },
};

export default nextConfig;
