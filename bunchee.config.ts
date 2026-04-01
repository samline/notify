import { defineConfig } from 'bunchee';

export default defineConfig({
  entries: [
    './src/notify.ts',
    { input: './src/browser-notify.js', format: 'umd', name: 'Notify', outDir: 'dist' }
  ],
  outDir: 'dist',
  format: ['esm', 'cjs'],
  external: ['vue', 'svelte/store'],
});
