# Changelog

## 0.1.0 - Initial rename and multi-adapter release

- Renamed internal controller `sileo` -> `notify` (kept `sileo` alias for compatibility).
- Package renamed to `@samline/notify`.
- UMD build changed to `dist/notify.umd.js` and exposes `window.notify` (compat `window.notifications`).
- Updated docs, examples and tests to reflect the rename.
- Copied styles to `dist/styles.css` as part of build.
