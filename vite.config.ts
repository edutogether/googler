import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    // dist/ is served publicly from GitHub Pages, so Sentry can fetch these
    // maps directly at symbolication time (via the sourceMappingURL comment
    // Vite adds to each bundle) without needing an upload step.
    sourcemap: true,
  },
  server: {
    watch: {
      // Windows fires an EBUSY watch error (crashing the dev server) when a
      // file is caught mid-rename from an image-tool's raw export name to
      // its final asset name. Ignore only that transient filename pattern,
      // not the whole folder, so newly renamed files are still picked up.
      ignored: ['**/ChatGPT Image*.png'],
    },
  },
});
