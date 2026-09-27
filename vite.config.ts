import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tailwindcss()],
  test: {
    environment: 'node',
    env: {
      TZ: 'America/Mexico_City',
    },
  },
});
