---
title: Reference
description: Authoritative documentation for the complete public surface of @samline/notify.
template: doc
sidebar:
  order: 1
---

Use these pages to find every public export and the runtime behavior behind it.

## Core reference

- [Configuration](/notify/reference/configuration/) documents every `ToasterOptions` and `ToastOptions` field.
- [API](/notify/reference/api/) covers `toast`, toaster lifecycle helpers, aliases, snapshots, and advanced exports.
- [Promise API](/notify/reference/promises/) explains the complete `toast.promise()` contract.
- [TypeScript](/notify/reference/typescript/) lists every exported public type and constant.
- [Entrypoints and module formats](/notify/reference/entrypoints/) helps you choose ESM, CommonJS, the browser registry, or the standalone IIFE.
- [Browser builds](/notify/reference/browser/) distinguishes the root `browser` export, `@samline/notify/browser`, and the IIFE global.
- [CSS styling](/notify/reference/css-styling/) documents inline styles, custom properties, and renderer attributes.

## Usage guides

- [Toast lifecycle](/notify/guides/toast-lifecycle/) explains creation, updates, timing, dismissal, reset, and teardown as one flow.
- [Actions and custom content](/notify/guides/actions-and-custom-content/) covers interactive controls and consumer-owned DOM.
- [Accessibility](/notify/reference/accessibility/) describes the actual live-region and keyboard behavior.
- [Framework integrations](/notify/reference/frameworks/) shows lifecycle-safe React, Vue, Svelte, and SSR patterns.
- [Examples](/notify/reference/examples/) provides self-contained recipes.
- [Troubleshooting](/notify/reference/troubleshooting/) covers mounting, CSS, CDN, CSP, duplicate mounts, and teardown.
