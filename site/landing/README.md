# Landing and Examples

These are one product surface. src/layouts/Main.astro composes shared metadata/fonts/theme, Header and Footer. Complete blocks are in src/sections; the shared Playground appears on Home, Examples and a Docs article. Its task integrations use Notify directly. Scenario copy, markup and behavior are shared with the gallery and complete copied files; maintain observable application outcomes and exact source execution. See ../brief/notify-second-pass-2026-11-04.md.

Editable interface/content copy is in src/i18n/translations/en. The project config owns identity, version, URLs and accents. Section/Box own layout; never add competing gutters or maximum widths.

From the root: npm run dev for two-origin development; npm run build && npm run preview for the production artifact and indexed Docs. Shared primitives live in ../shared; do not duplicate them here.

The combined build assembles Docs, local fonts, social artwork, robots and the merged sitemap into dist. CI validates the resulting site before Pages deployment. Read ../AGENTS.md and ../ADAPTATION.md for coverage and publication rules.

Follow the root [PageSpeed performance contract](../AGENTS.md#pagespeed-performance-contract) for targets, asset/loading conventions, layout stability, measurement evidence and publication verification. Keep this policy linked when replicating the theme.

Drawer integration uses the published 5.1.1 root createDrawer API, native cloned content and owned-controller destruction. Native Drawer keeps focus, dismissal, gestures and locking; the site keeps its own ARIA state and lifecycle cleanup.
