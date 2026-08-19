import { defineConfig } from 'vite';
import type { Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

/**
 * GitHub Pages serves static files only, so a deep link such as
 * `/<repo>/mock-tests` would 404 before React Router ever runs. Pages falls
 * back to `404.html`, so shipping a copy of `index.html` under that name makes
 * client-side routing work for direct links and refreshes alike.
 */
function spaFallback(): Plugin {
  return {
    name: 'spa-404-fallback',
    apply: 'build',
    closeBundle() {
      const dist = path.resolve(__dirname, 'dist');
      const indexHtml = path.join(dist, 'index.html');
      if (fs.existsSync(indexHtml)) {
        fs.copyFileSync(indexHtml, path.join(dist, '404.html'));
      }
    },
  };
}

/**
 * GitHub Pages base path.
 * ---------------------------------------------------------------------------
 * When the site is served from https://<user>.github.io/<repository>/ every
 * asset URL must be prefixed with `/<repository>/`.
 *
 * The value is read from the `VITE_BASE_PATH` environment variable so that the
 * repository name is never hard-coded in the source:
 *
 *   - Local development / user pages  ->  "/"        (the default)
 *   - Project pages                   ->  "/<repo>/"
 *
 * The bundled GitHub Actions workflow (.github/workflows/deploy.yml) sets this
 * automatically from `${{ github.event.repository.name }}`, so renaming or
 * forking the repository needs no code change at all.
 */
const basePath = process.env.VITE_BASE_PATH ?? '/';

export default defineConfig({
  base: basePath,
  plugins: [react(), spaFallback()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});
