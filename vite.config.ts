import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/googler/',
  plugins: [react()],
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
