import type { NextConfig } from "next";
import path from "path";
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, "../.env") });

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  reactCompiler: true,
  outputFileTracingRoot: path.resolve(__dirname, ".."),
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
};

export default nextConfig;
