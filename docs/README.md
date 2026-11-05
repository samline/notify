# Toast notifications for the web

Notify is a dependency-free toast runtime for the browser. Mount one toaster, call `toast()` from anywhere in your application, and the package owns the stack, timers, gestures, keyboard access and screen-reader announcements.

```ts
import { createToaster, toast } from '@samline/notify'
import '@samline/notify/styles.css'

createToaster({ position: 'bottom-right', richColors: true })

toast.success('Profile saved', {
  description: 'Your changes are live.',
  action: { label: 'View profile', onClick: () => location.assign('/profile') }
})
```

## Start building

<!-- notify:cards -->

- [Installation](installation.md) — Choose Package / ESM or HTML / CDN and send your first toast.
- [Working examples](recipes.md) — Saves, retries, undo, progress, promises and custom content. Copy complete files.
- [API reference](api/index.md) — `toast`, the toaster lifecycle, return values and cleanup.
- [Changelog](../CHANGELOG.md) — Recorded release changes, including behavior changes.

## Choose your integration

Use `@samline/notify` for named ESM or CommonJS imports, or `@samline/notify/browser` for the same helpers collected in one registry object. Plain HTML and CMS templates load the standalone script and stylesheet; the script exposes `window.Notify` and mounts a default toaster once the body exists.

Read [entrypoints](entrypoints.md) for the loading options and [framework integrations](frameworks.md) for React, Vue, Svelte and Astro.

## Styling and accessibility

The stylesheet supplies layout, stacking, motion, light and dark palettes and reduced-motion support. Restyle it with CSS custom properties and `data-*` selectors ([CSS styling](css-styling.md)), or render your own DOM with `toast.custom()`. Notify renders a polite live region, pauses timers on hover, focus and hidden tabs, and keeps focus on the page when a focused toast leaves. Your application still owns meaningful messages and timing; see [accessibility](accessibility.md).

## How it works

Every toast is a record in one shared state object. `toast()` adds or updates a record by id and notifies subscribers; the mounted toaster reconciles one `ol` and one `li` per active toast and drives CSS transitions through data attributes. Read the [runtime contract](getting-started.md) for the complete model.

## Version

This site documents `@samline/notify` from the repository's current source. CDN examples pin the latest published version; check the [changelog](../CHANGELOG.md) for unreleased changes.
