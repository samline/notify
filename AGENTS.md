# @samline/notify

Accessible, dependency-free toast notifications for JavaScript and TypeScript, with ESM, CommonJS, and browser builds.

Package memory: decisions and lessons specific to this package. Family rules are in the block below.

- The website lives in `site/` (Landing, Examples and Docs; `site/AGENTS.md` and the template's package-site skill hold its rules). It never ships in the npm tarball.

## Package lessons

- Keep numeric and string toast IDs distinct internally even though `data-id` serializes both to text.
- Timer pauses must store a deadline and subtract elapsed time before resuming.
- `ToasterController.update()` is partial: omitted offsets, gaps, styles, and subscriptions must remain unchanged.
- Tests for browser globals and package exports must execute built artifacts, not only TypeScript source modules.
- CDN examples must reference an actually published version or `latest`; a package version in Git does not imply npm availability.
- GitHub only discovers Actions workflows under the repository-root `.github/workflows`; website commands run from `site` and Pages uploads `site/landing/dist`.
- Astro 7 documentation jobs require Node.js 22.12.0 or newer; keep CI, Pages deployment, and `site` engine metadata aligned.
- Test standalone globals as classic scripts in a real browser: JSDOM eval can conceal a bundler namespace overwriting window.Notify.
- Promise completion must retain record identity and reset epoch across async formatters; dismissal, reset, replacement and teardown revoke ownership.
- Hidden and exiting toast actions must be inert; keyboard shortcuts target the front visible record.
- Canonical docs live in docs/. Run site sync:docs after edits, check exact synchronization and historical route/fragment mappings, and execute the exact copied ESM/CDN sources.
- A CSS fingerprint validates styles, not useful demos or complete documentation. Compare full compositions against Ticker/Drawer, review prose and exercise task outcomes and lifecycle cleanup.
- Check visible documentation installers during delayed initialization, not only Home tabs. Render fallback panel labels inside noscript so assigning tabpanel roles does not remove a painted label and shift the first code frame. Preserve both no-JavaScript readability and protected styles.
- For the Notify gallery, review capability → consumer task → observable outcome → copied source → lifecycle. A count of presets, export inventory, green link checks and style hashes cannot establish task depth or visual reading quality. Keep composed decisions, cancellation, results, editable custom content and stack interaction covered.
- Responsive review must open notifications and inspect their usable text width, not only document overflow. Two actions previously reduced the message to about 60 px at 320 px despite passing overflow checks; keep the separate action row and built-browser reading-width regression.
- Custom content factories can run again after controller updates. Each render must release its listeners; preserve draft state outside the factory and dispose render listeners on replacement, dismissal and integration teardown.
- Accessibility audits must open notifications and expand the five semantic variants in both themes: a page without toasts cannot detect the package's contrast failures. Recipes must compile against the real types; an export inventory or an import resolved as `any` does not prove them correct.
- In development Docs uses another base and origin. Check referenced public assets (favicon included), not only navigation links; production combines both apps under one base.
- Previews that follow the page theme must update preferences without resending `duration`: sending it restarts the timers. A regression test must fail against the previous artifact before its green result counts; the final deadline test uses real time.
- Fingerprints and green tests do not close a visual review: check real inputs and selects, the semantic surface, a valid font, a separate arrow with reserved padding, pointer/text/not-allowed cursors, hover, focus and disabled states. Check the usable value width at 320 px and 200% text too: a field without overflow could leave only 64 px for text. Compare the pinned Ticker/Drawer sources and review the copied files as well as the preview.
- Lifecycle callbacks (`onDismiss`) belong in the shared state, not in renderers: a per-renderer call fires once per mounted toaster and never without one.
- Never put an `aria-label` on a toast item: it replaces the description, actions and custom content for screen readers.
- Home's first playground tab is the Toast types panel; e2e tests that use a scenario preset on Home must select its tab first.
- `bun run site:check:release` compares sha256 hashes of reviewed sources recorded in `site/content-audit.json`. After reviewing edits to README.md, docs/ or shared visual sources, refresh those hashes in the same commit or CI fails.
- Playwright `grep` also matches the project name: never name a project with a word its own `grep` filters on.
- Copied CDN examples are tested against this checkout's `dist/`, so the CI browser jobs build the package first.
- Never add AI co-author or "Generated with" lines to commits, tags or PRs.
- At 320px and 200% text, a persistent custom toast can cover its underlying preview reset. Browser flows must use the card's own visible close control before clicking the page beneath it; never force the covered reset or hide the failure with retries/timeouts. Five repeated runs and the complete scenarios project verify this sequence.
- Copied examples must read like code a visitor would write. `site/shared/lib/demo-behavior.js` holds one self-contained `<preset>Demo(element, notify, copy, signal)` function per `#region` (plus a tiny `wait` region); `demo-files.ts` copies the chosen region verbatim, so a copy has no site helper. Do not go back to a shared handler pruned by an AST transform or a helper object in the copies. Site-only concerns (page theme, baseline toaster options shared by previews, detaching a preview) live in the Playground host. Re-enable controls before any trailing wait: a disabled button cannot be focused, which left a toast focus-paused forever.
- Copied-code disclosures show loading-mode tabs followed directly by file tabs. Keep installation and delivery explanations in the installation guide, without extra prose in the code viewer.

## Identity convention — 2026-11-06

README structure follows the canonical template proposal, including TOC/resource
roles, installation blocks, API/guide tables, entrypoints and skill source/download.
Shared site-identity.mjs composes `<subject> — <npm name>` once for document and
social titles. Footer display credit is explicitly samline, independent of npm
author metadata. Keep the identity check in verify/release/CI, and test the real
configured header name before a substituted sibling. The maintained policy is
https://github.com/samline/package-landing-docs/blob/main/.agents/identity.md;
package-specific API content and runtime publication remain separate.

## pnpm migration and 5.0.0 — 2026-11-15

- Installs with pnpm (`pnpm-workspace.yaml` lists `site`, `site/landing`, `site/docs`, `site/shared`); every script runs with `bun run`. `site/package.json` has no npm workspaces: its scripts call `bun run --cwd <app>`, and `scripts/test-adaptation.mjs` links each app's own `node_modules` into the isolated copy.
- 5.0.0 breaking renames: `dist/browser/notify.global.js` (the old `global.global.js` is still built as an identical alias), `style.css` (the `styles.css` export and file stay as aliases), and no `default` export from the classic script.
- `site/content-audit.json` records sha256 hashes of every reviewed source. After reviewing a change to them, refresh the hashes or `bun run site:check:release` fails.
- The website's checks, the package smoke tests and the three browser projects run in `.github/workflows/site.yml`; the managed `ci.yml` only runs the family checks.
- The site depends on the published `@samline/notify` `^5.0.0` and `@samline/drawer` `6.0.0`, but builds the runtime from `src/` through `site/shared/lib/notify-runtime.mjs`.

<!-- samline:family:start -->

## Family conventions (@samline)

This block is synced from the template that owns the family conventions ([package-landing-docs](https://github.com/samline/package-landing-docs) `family/AGENTS.md`, `node family/scripts/sync.mjs`). Do not edit it here; change the template and re-sync. The skill `.agents/skills/samline-package/SKILL.md` carries the full rules for a repository cloned on its own.

- One package per repository. Framework-agnostic core in JS/CSS/HTML; adapters only when idiomatic, as optional peers.
- No DOM access at import time; without a DOM, calls are no-ops. Respect `prefers-reduced-motion`; content stays visible without JavaScript.
- Arrow functions and closures, no classes or `this`. `destroy()` is idempotent and restores markup.
- Zero runtime dependencies: shared primitives (`@samline/internal`, `@samline/is-visible`, `@samline/debounce`) are devDependencies bundled with `noExternal`.
- Install with pnpm, run with Bun: `pnpm install` / `pnpm add -D` (only `pnpm-lock.yaml` is committed), `bun run <script>` for everything else. Never `bun install`, `bun add`, `npm install` or `yarn`.
- Packages talk through npm only: install the published version of any sibling package. Never link or import a local checkout (`bun link`, `link:`, `file:`, path aliases, `../other-package/src`).
- Layout: `src/core`, `src/vanilla`, `src/browser/global.ts` (`window.<PascalName>`, or a plain non-colliding name such as `Strings` when that is a built-in, never a `Samline` prefix; `dist/browser/<name>.global.js`), side-effect-free `src/index.ts`. Every public entry has a gzip budget in `package.json` → `size`.
- `bun run check` must pass: format, typecheck, unit tests with coverage thresholds, build, size budgets, e2e in Chromium, Firefox and WebKit.
- README is the package guide and the site's source of truth; public text in English. Any public API change updates tests, README, docs, examples and `skills/<name>/SKILL.md` together.
- Releases: Keep a Changelog entry for every user-facing change, semver, pinned CDN URLs bumped before release. Publishing is manual (`bun run release` by the maintainer); CI never publishes; no `--provenance`.
- Public repository: no dated reports, handoff notes, transcripts or client names; private notes go in the ignored `.local/`. Site examples with state offer Reset; icons are SVG, never Unicode glyphs.
- Work skills: `npx autoskills -y -a universal`, tracked with `skills-lock.json`, minus the `bun` skill (it contradicts pnpm installs), plus `modern-web-guidance`, consulted before HTML, CSS or client-side JavaScript work.
- Always explore code through the `codebase-memory` skill and graph when `codebase-memory-mcp` is installed; read source for gaps.
- Never add AI attribution to commits, tags or pull requests.

<!-- samline:family:end -->
