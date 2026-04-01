import { defineConfig } from 'bunchee';

export default defineConfig({
  entries: [
    './src/index.ts',
    './src/notify.ts',
    './src/react-notify.tsx',
    './src/vue-notify.ts',
    './src/svelte-notify.ts',
    { input: './src/browser-notify.js', format: 'umd', name: 'Notify', outDir: 'dist' }
  ],
  outDir: 'dist',
  format: ['esm', 'cjs'],
  external: ['react', 'react-dom', 'vue', 'svelte/store'],
});
