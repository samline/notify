import { defineConfig } from 'tsup'
import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'

// `@samline/notify` is framework-free. There are no peer dependencies to
// mark as `external` and no optional runtime to bundle in.
//
// The two build entries reflect the two supported ways to consume the
// package:
//
//   1. ESM + CJS + types (`index`) — consumed by bundlers (Astro/Vite/
//      webpack/etc.). `clean: true` wipes `dist/` before writing so
//      leftovers from previous runs do not leak into the new bundle.
//
//   2. IIFE (`browser/global`) — loaded standalone via a single `<script>`
//      tag. `clean: false` keeps the index entry's assets in place; the
//      entry only adds its own files under `dist/browser/`. The
//      entry itself installs `window.Notify`. Do not set globalName:
//      an exported module namespace would overwrite that registry after
//      the IIFE finishes executing as a classic browser script.
//
// `src/style.css` is a static asset that ships as
// `@samline/notify/style.css` (see `package.json` exports). The
// `onSuccess` hook copies it to `dist/style.css` after the index
// build runs so consumers can import it without going through a
// bundler.

const copyStylesHook = async (): Promise<void> => {
  copyFileSync(resolve('src/style.css'), resolve('dist/style.css'))
  // The v4 file name, kept so existing CDN URLs keep working after a version bump.
  copyFileSync(resolve('src/style.css'), resolve('dist/styles.css'))
}

export default defineConfig([
  {
    entry: {
      index: 'src/index.ts',
      'browser/index': 'src/browser/index.ts',
    },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    target: 'es2020',
    outDir: 'dist',
    external: [],
    onSuccess: copyStylesHook,
  },
  {
    // notify.global.js is the family name; global.global.js stays as an alias
    // for v4 CDN URLs.
    entry: {
      'browser/notify': 'src/browser/global.ts',
      'browser/global': 'src/browser/global.ts',
    },
    format: ['iife'],
    minify: true,
    dts: true,
    sourcemap: true,
    clean: false,
    target: 'es2020',
    outDir: 'dist',
  },
])
