---
title: Reference
description: Authoritative documentation for every public symbol in @samline/notify.
template: doc
sidebar:
  order: 1
---

This section documents the complete public surface of `@samline/notify`. Pages are grouped by concept — configuration, API, types, browser usage, styling, and examples — so you can scan to what you need without diving into the source.

:::note
If you add a new page under `src/content/docs/reference/`, declare its `slug` inside the `sidebar` array in `site.config.mjs` to control its position.
:::

## Sections in this reference

- [Configuration](/notify/reference/configuration/) — every `ToasterOptions` and `ToastOptions` field, with defaults and rationale.
- [API](/notify/reference/api/) — method-by-method signatures, parameters, return shapes, and behaviour tables.
- [TypeScript](/notify/reference/typescript/) — every exported type, callback signature, and helper return shape.
- [Browser global](/notify/reference/browser/) — the `window.Notify` IIFE for no-bundler setups (Shopify, WordPress, classic templates).
- [CSS styling](/notify/reference/css-styling/) — the data-attribute contract the stylesheet expects; theming with CSS variables.
- [Examples](/notify/reference/examples/) — end-to-end recipes for common real-world scenarios.
