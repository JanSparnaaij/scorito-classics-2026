import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['playwright', 'chromium-bidi', 'db', 'scraping', 'core', 'dotenv'],
});
