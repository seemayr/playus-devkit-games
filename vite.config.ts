import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^@playus\/(.+)$/,
        replacement: `${fileURLToPath(new URL('./src/playus', import.meta.url))}/$1`,
      },
      {
        find: '@playus',
        replacement: fileURLToPath(new URL('./src/playus/index.ts', import.meta.url)),
      },
    ],
  },
  server: {
    fs: {
      allow: [fileURLToPath(new URL('.', import.meta.url))],
    },
  },
});
