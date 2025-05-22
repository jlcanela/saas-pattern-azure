import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  tsconfig: "tsconfig.dts.json",
  format: ['cjs', 'esm'],
  dts: {
    entry: "./src/index.ts",
    resolve: true
  },
  outExtension: ({ format }) => ({
    js: format === 'esm' ? '.mjs' : '.cjs',
  }),
  clean: true,
  sourcemap: true,
  splitting: false
});