import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  target: 'node20',
  clean: false,
  outDir: 'api',
  noExternal: [/(.*)/], // Bundle everything
  external: ['@prisma/client', 'bcryptjs'], // Except Prisma native deps
});
