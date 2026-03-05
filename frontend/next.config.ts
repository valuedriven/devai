import type { NextConfig } from "next";
import path from "path";
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, "../.env") });

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // No Vercel, o standalone não é necessário e o tracing é gerenciado pela plataforma.
  // No Docker, o standalone é obrigatório (veja Dockerfile).
  output: process.env.VERCEL ? undefined : 'standalone',

  // No monorepo, o root do workspace é o diretório pai.
  // Mantemos consistência entre outputFileTracingRoot e turbopack.root para evitar avisos.
  outputFileTracingRoot: process.env.VERCEL ? undefined : path.resolve(__dirname, ".."),
  turbopack: {
    root: process.env.VERCEL ? undefined : path.resolve(__dirname, ".."),
  },
};

export default nextConfig;
