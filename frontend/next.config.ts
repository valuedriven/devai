import type { NextConfig } from "next";
import path from "path";
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, "../.env") });

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // standalone não é necessário no Vercel e pode causar problemas de caminhos em monorepos
  // output: 'standalone',
  // outputFileTracingRoot só deve ser usado se houver dependências fora do frontend
  // que precisam ser rastreadas para o runtime (e.g. em Docker)
  // No Vercel, isso pode causar o erro de lstat com caminhos duplicados
  outputFileTracingRoot: process.env.VERCEL ? undefined : path.resolve(__dirname, ".."),
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
};

export default nextConfig;
