import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3001,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          '@shared/api': path.resolve(__dirname, '../../packages/shared-api/src'),
          '@shared/constants': path.resolve(__dirname, '../../packages/shared-constants/src'),
          '@shared/services': path.resolve(__dirname, '../../packages/shared-services/src'),
          '@shared/types': path.resolve(__dirname, '../../packages/shared-types/src'),
          '@convex': path.resolve(__dirname, '../../convex'),
        }
      }
    };
});
