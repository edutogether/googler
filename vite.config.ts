import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const tunerDirectory = 'D:/Project/_visual-tuner/be-a-googler';
const tunerFiles = new Set([
  'draft.json', 'pc-approved.json', 'mobile-approved.json', 'change-log.json',
  'approved-adjustments.json', 'approved-adjustments.md',
]);

function visualTunerStorage() {
  return {
    name: 'visual-tuner-storage',
    apply: 'serve' as const,
    configureServer(server: { middlewares: { use: (handler: (request: { method?: string; url?: string; on: (event: string, listener: (chunk: Buffer) => void) => void }, response: { statusCode: number; setHeader: (name: string, value: string) => void; end: (body?: string) => void }, next: () => void) => void) => void } }) {
      server.middlewares.use((request, response, next) => {
        const url = new URL(request.url ?? '/', 'http://localhost');
        if (url.pathname !== '/__visual-tuner/state') { next(); return; }
        const file = url.searchParams.get('file') ?? '';
        if (!tunerFiles.has(file)) { response.statusCode = 400; response.end('Invalid visual tuner file.'); return; }
        const path = resolve(tunerDirectory, file);
        if (request.method === 'GET') {
          void readFile(path, 'utf8').then((content) => { response.setHeader('content-type', 'application/json; charset=utf-8'); response.end(content); }).catch(() => { response.statusCode = 404; response.end('{}'); });
          return;
        }
        if (request.method !== 'PUT') { response.statusCode = 405; response.end(); return; }
        let body = '';
        request.on('data', (chunk) => { body += chunk.toString(); });
        request.on('end', () => {
          try {
            const payload = JSON.parse(body) as { file?: string; value?: unknown };
            if (payload.file !== file || !tunerFiles.has(payload.file)) throw new Error('Invalid payload');
            const output = typeof payload.value === 'string' ? payload.value : `${JSON.stringify(payload.value, null, 2)}\n`;
            void mkdir(tunerDirectory, { recursive: true }).then(() => writeFile(path, output, 'utf8')).then(() => { response.setHeader('content-type', 'application/json'); response.end('{"ok":true}'); }).catch(() => { response.statusCode = 500; response.end('{"ok":false}'); });
          } catch { response.statusCode = 400; response.end('{"ok":false}'); }
        });
      });
    },
  };
}

export default defineConfig({
  base: '/googler/',
  plugins: [react(), visualTunerStorage()],
});
