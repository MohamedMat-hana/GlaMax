/**
 * vite-admin.config.js — Vite config for the admin panel (port 5174).
 * Serves admin.html as the entry point; proxies API to the same backend.
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/** Plugin that rewrites / → /admin.html in the dev server */
function serveAdminHtml() {
  return {
    name: 'serve-admin-html',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url === '/' || req.url === '/index.html') {
          req.url = '/admin.html';
        }
        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), serveAdminHtml()],
  root: '.',
  build: {
    rollupOptions: { input: './admin.html' }
  },
  server: {
    port: 5174,
    proxy: {
      '/api':     { target: 'http://localhost:4000', changeOrigin: true },
      '/uploads': { target: 'http://localhost:4000', changeOrigin: true }
    }
  }
});
