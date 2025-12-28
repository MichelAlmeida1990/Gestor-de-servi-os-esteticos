import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Configuração para resolver path aliases corretamente durante o build
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, '.'),
    };
    return config;
  },
  
  // Configuração Turbopack (Next.js 16+ usa Turbopack por padrão)
  turbopack: {
    resolveAlias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
};

export default nextConfig;