import { defineConfig } from 'bunchee';

export default defineConfig({
  entries: [
    './src/agnostic-sileo.ts',
    { input: './src/browser-sileo.js', format: 'umd', name: 'Sileo', outDir: 'dist' }
  ],
  outDir: 'dist',
  format: ['esm', 'cjs'],
  external: ['vue', 'svelte/store'],
});
