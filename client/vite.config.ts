import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The client is served on :5173 in dev; /api is proxied to the Express server.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.API_PORT || 8787}`,
        changeOrigin: true,
      },
    },
  },
});
