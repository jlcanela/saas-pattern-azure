import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  outExtension: ({ format }) => ({
    js: format === 'esm' ? '.mjs' : '.cjs',
  }),
  clean: true,
  sourcemap: true,
});