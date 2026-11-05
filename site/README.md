# Notify — Landing, Examples & Docs

The public website of [`@samline/notify`](https://www.npmjs.com/package/@samline/notify). Home, Examples and Docs share one component library, typography system, palette, clipboard behavior and accessibility conventions. Every word and code sample describes the real package runtime in this repository.

[Live site](https://samline.github.io/notify/) · [Adaptation guide](ADAPTATION.md) · [Upstream changes](UPSTREAM.md) · [Package changelog](../CHANGELOG.md)

## Table of contents

- [Installation](#installation)
- [Quick start](#quick-start)
- [Capabilities](#capabilities)
- [API at a glance](#api-at-a-glance)
- [Documentation](#documentation)
- [Changelog](#changelog)
- [AI agent skill](#ai-agent-skill)
- [License](#license)

## Installation

Use Node **22.12+** and npm. This is a private website workspace, not an installable runtime package.

```sh
npm ci
```

## Quick start

<a id="start"></a>

```sh
npm run dev
```

Open `http://127.0.0.1:4330/notify/`. Landing runs on 4330; Docs owns its Astro development module origin on 4331. Article links redirect there, and Docs Home/Examples links return to 4330. The production build remains one origin. For indexed search and the exact deployable site:

```sh
npm run build
npm run preview
```

The combined artifact is **landing/dist/**. Search uses local Pagefind, generated after the docs build; it needs no backend or API key. An unbuilt development server has a recoverable search fallback.

### How this site was configured

The site was configured from the package it documents. The importer reads the source package's manifest, inventory and README/changelog snapshots. It changes only this website's `project.config.json`, `brief/` and `content-audit.json`; it never changes or executes the source package.

```sh
npm run configure -- --package .. \
  --site-url https://samline.github.io/notify/ \
  --accent-light '#b45309' --accent-dark '#fbbf24'
```

Identity, deployment base and the amber accent live in `project.config.json`. The amber pair is the maintainer's choice: `#b45309` on light surfaces and `#fbbf24` on dark ones, both above 4.5:1 contrast against the surfaces they are used on. The CDN entries point at the published `@samline/notify@3.2.0` assets; remove them if that release is no longer available.

Re-running the importer resets the content audit, so review that diff. `npm run check:release` rejects an adaptation whose audit, theme review or capability review is unfinished.

The [adaptation workflow](ADAPTATION.md) covers standalone sites and embedding the three directories into an existing package without replacing its manifest, runtime scripts or public README.

The visual source of truth is [samline/ticker](https://github.com/samline/ticker), pinned in [REFERENCE.md](REFERENCE.md) and `design-reference.json`. Content adaptation must preserve its design. `npm run check:design` catches unreviewed stylesheet drift; consult the mapped original before rebuilding UI.

## Capabilities

- Home, Examples and Docs with shared components, typography and light/dark colors.
- Astro content collections, local Pagefind search and reusable highlighted code/file tabs.
- Responsive navigation, exact code copying and accessible keyboard controls.
- Package inventory and content-audit workflows for complete documentation adaptation.
- One GitHub Pages artifact supporting domain roots and repository base paths.
- A repository-local agent skill and checks for design, links, accessibility and adaptation.

## API at a glance

This workspace configures and renders the Notify website. The package runtime API lives one directory above it.

### Where to edit

| Input                                                                                     | Owner                                                 |
| ----------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Name, npm name, version, description, URLs, theme storage namespace and two accent colors | `project.config.json`                                 |
| Landing copy, FAQ and navigation                                                          | `landing/src/i18n/translations/en/`                   |
| Shared control messages and scenario copy                                                 | `shared/i18n/translations/en/`                        |
| Docs shell messages and page labels                                                       | `docs/src/i18n/translations/en/`                      |
| Generated guides, references and MDX compositions                                         | `docs/src/content/docs/`                              |
| Single release-note source                                                                | `../CHANGELOG.md`, loaded into the collection         |
| Shared UI, highlighting and design tokens                                                 | `shared/components/`, `shared/styles/`, `shared/lib/` |
| Package evidence and semantic coverage                                                    | `brief/`, `content-audit.json`                        |

Use `site.template: true` while writing the package content: generated metadata and robots discourage indexing. Set it to false only after adaptation and review. `npm run check:release` rejects starter mode or incomplete/mismatched audit evidence; it does not prove prose is correct. The target version may be prepared before npm publication, but do not claim CDN execution against a published artifact until it exists.

| Command                                              | Purpose                                         |
| ---------------------------------------------------- | ----------------------------------------------- |
| `npm run configure -- --package PATH --site-url URL` | Import package evidence and configure identity. |
| `npm run dev`                                        | Start the supervised Landing and Docs servers.  |
| `npm run build`                                      | Build and audit the combined site.              |
| `npm run preview`                                    | Preview the production artifact.                |
| `npm run verify`                                     | Run the full adaptation validation.             |
| `npm run check:release`                              | Reject unfinished package adaptations.          |

## Documentation

Edit package reference prose in `../docs/`, then run `npm run sync:docs`. `documentation-map.json` defines the 22 source-to-article mappings; `check:docs` rejects drift. The migration inventory in `brief/documentation-migration.json` preserves 35 historical articles and 323 sections, including meaningful fragment destinations.

The eleven task scenarios and their ESM/CDN copies share `demo-behavior.js`, scenario markup and scoped styles. Framework files have separate compiler checks; CMS fixtures exercise lifecycle behavior locally, without claiming a hosted Shopify or WordPress deployment. The live site uses the local 3.2.1 runtime; CDN files intentionally use published 3.2.0 with namespace resolution.

Start with [ADAPTATION.md](ADAPTATION.md). Maintenance conventions live in [AGENTS.md](AGENTS.md); the committed visual reference is recorded in [REFERENCE.md](REFERENCE.md).

### Checks

```sh
npm exec -- playwright install chromium
npm run verify
```

This runs configuration/contrast checks, both Astro checks, formatting, unit tests, alternate-package builds at root and nested bases, combined build/link validation and browser tests. Browser tests cover shared typography/highlighting, exact copying and reset, executable separate/complete files, repeated previews, responsive/enlarged text, both themes, search, ToC, drawer focus/scroll and no JavaScript. Run `npm run check:release` as well for an adapted package.

### Deploy

The workflows under `../.github/workflows/` validate changes and publish **one** Pages artifact. Set GitHub Pages to **GitHub Actions**, set `site.url` to the actual public root, then run the Deploy workflow. Deployment is opt-in; add a main push trigger only when the new package site is ready. Both a repository base (`/my-package/`) and a domain root (`/`) are supported; Docs always lives below the configured root at `docs/`. Never hardcode the old template base in links, search paths, metadata, tests or redirects.

This repository is a private npm workspace (`private: true`) and is not intended for npm publication. When embedded in a public package, preserve its runtime-only `files` allowlist and exclude all website/tooling directories from npm. [LICENSE.md](LICENSE.md) covers the theme; bundled font licenses are under `shared/assets/fonts/` and included in the generated font-licenses directory.

Reviewed upstream changes and their template equivalents are recorded in [UPSTREAM.md](UPSTREAM.md). Website fonts use local WOFF2; social rendering retains separate TTF inputs. Component scripts use function setup with shared lifecycle cleanup, and code copying reads the live highlighted source. The shared build policy inlines small CSS while keeping larger styles cacheable.

### Performance validation

The permanent policy is the [PageSpeed performance contract](AGENTS.md#pagespeed-performance-contract), shared by Home, Examples and Docs. Every adaptation retains that policy and measures its own production artifact. Targets are at least 95 mobile performance, 100 desktop and 100 accessibility/best practices/SEO after adaptation; they are goals, not results. Starter mode deliberately remains noindex.

Record the commit/dirty state, date, route, browser/Lighthouse versions, device, throttling and cache state, then compare medians from at least three equivalent cold mobile runs before/after a performance change. Track FCP/LCP/TBT/CLS/Speed Index, compressed HTML/CSS/JS/fonts, requests and repeat navigation. Measure a representative article separately from Home and Examples. Use the same environment and avoid concurrent builds/tests while timing.

#### Notify measurements — 2026-10-31

Lighthouse 13.6.0, Chromium 151, Node 24.14.0, production artifacts served by identical local HTTP gzip fixtures. Mobile uses the simulated Moto G Power profile (412 × 823, 4× CPU, 150 ms RTT, 1,638.4 Kbps). Each row is the median of three fresh-browser, cold-cache runs without concurrent builds or tests. The baseline was reconstructed from commit `5150f4e` with the same website toolchain after editing; it was not measured before the work began. The final artifact is the dirty working tree on that commit. This comparison includes content expansion, not an isolated performance optimization.

| Route    | Performance before → after | FCP/LCP before → after | TBT  | CLS before → after  | Speed Index before → after | Requests | Transfer before → after |
| -------- | -------------------------- | ---------------------- | ---- | ------------------- | -------------------------- | -------- | ----------------------- |
| home     | 100 → 100                  | 0.911 → 0.908 s        | 0 ms | 0.000023 → 0.000023 | 1.132 → 1.016 s            | 15 → 15  | 157.5 → 156.9 KiB       |
| examples | 100 → 98                   | 0.902 → 1.802 s        | 0 ms | 0.000023 → 0.000023 | 0.902 → 1.802 s            | 15 → 15  | 154.5 → 334.1 KiB       |
| docs     | 100 → 100                  | 0.837 → 1.023 s        | 0 ms | 0.007072 → 0.000780 | 0.837 → 1.023 s            | 16 → 16  | 147.9 → 165.6 KiB       |

Accessibility, best practices and SEO scored 100 on all mobile runs. No audit returned an internal error. These are automated lab checks, not complete accessibility certification or field Core Web Vitals.

Desktop checks (one cold run per final route, not medians):

- home: performance 100, accessibility 100, best practices 100, SEO 100.
- examples: performance 100, accessibility 100, best practices 100, SEO 100.
- docs: performance 100, accessibility 100, best practices 100, SEO 100.

An initial desktop Docs run scored 97 with CLS 0.108. Moving fallback tab labels into noscript preserved the final design and eliminated the first code-frame initialization shift; the added geometry regression passes. The final desktop observation is CLS 0.029 and performance 100, not zero CLS.

The gallery increases from one demonstration to eight scenarios with static highlighted ESM/CDN separate and complete files. Its larger document explains the transfer and FCP/LCP regression despite unchanged request counts and zero TBT. That cost is retained to preserve readable, exactly copyable no-JavaScript source while exceeding the 95 mobile target; it is not a measured speedup. Installation similarly gains complete files in both modes. Home becomes smaller.

| Route    | Gzip HTML before → after | Gzip external JS before → after | Gzip external CSS before → after | WOFF2    |
| -------- | ------------------------ | ------------------------------- | -------------------------------- | -------- |
| home     | 21.3 → 19.1 KiB          | 26.8 → 28.1 KiB                 | 10.0 → 10.3 KiB                  | 96.4 KiB |
| examples | 18.3 → 196.2 KiB         | 26.8 → 28.1 KiB                 | 10.0 → 10.3 KiB                  | 96.4 KiB |
| docs     | 28.0 → 45.6 KiB          | 20.1 → 20.1 KiB                 | 0.0 → 0.0 KiB                    | 96.4 KiB |

Docs CSS is inlined and included in HTML size. Raw Lighthouse JSON, per-run metrics and encoded-size summaries were retained locally outside Git. This fixture does not verify deployed compression, cache headers or HTTPS behavior. No cache policy changed; no repeat-navigation caching improvement is claimed. Verify an authorized deployment’s exact commit and live assets before recording PageSpeed or field results. Missing field data stays unknown. Ticker’s measurements remain evidence for Ticker only.

### Second-pass quality review — 2026-11-04

[The capability matrix and review](brief/notify-second-pass-2026-11-04.md) records user tasks, observable outcomes, limitations and reproduced fixes. Decisions, cancelable CSV output, editable custom DOM and the live stack exercise combinations of capabilities rather than filling a preset count. Live and copied integrations share one behavior source; copied files retain only their used helpers and messages. Existing historical fragments remain covered by the migration gate. The dated measurements above describe the earlier eight-scenario artifact; current measurements are recorded separately.

### Adaptation quality lessons

An accent choice must come from the maintainer or an approved brief. The importer leaves `content-audit.json.themeReview` pending; record the preference source and actual light/dark values after confirmation. `check:release` rejects missing or mismatched theme review. The default palette remains the neutral reference, not an assumed choice for every package.

`check:design` protects source stylesheet fingerprints, not complete route composition or useful product demos. Replace the counter's content and controls, preserve multi-scenario Home tabs where relevant, reuse the same real preview across the site, and supply actual complete/split source for every supported loading mode. Keep generated scripts/CSS out of client translation catalogs. Review all sections beside the pinned Ticker reference and keep installation concise while preserving the full runtime reference elsewhere. See [ADAPTATION.md](ADAPTATION.md) and [the skill](.agents/skills/package-site/SKILL.md).

A custom semantic accent palette is shared through SiteHead; it covers cards, tabs, controls, halos and code keywords while preserving neutral contrast and reference geometry. The browser suite tests custom accents against later base-style delivery. Development redirects isolate Astro compiler module namespaces; do not replace them with an HTML-only proxy. The dev runner uses foreground child servers so both are supervised even under an agent-enabled Astro CLI.

The browser suite discovers every authored documentation article for metadata, responsive/enlarged-text and automated accessibility checks. Its production server uses a separate port (4338) and cannot silently reuse a development server. Preserve that isolation and dynamic article inventory when embedding the template.

Capability coverage is part of adaptation. The importer inventories documentation under example/examples as well as docs; that inventory still requires semantic review. Complete content-audit.json.capabilityReview with supported integrations, distinct observable scenarios and equivalent-scope initialization modes. See the repository skill's references/content-completeness.md. Do not fill a compatibility row with module formats alone, or replace a short initialization tab with a whole HTML document. The neutral starter links to full working files outside its compact initialization card.

### Integration and identity parity — 2026-10-20

Keep Framework integrations as a first-class guide for packages that support browser hosts. Provide real React/Vue/Svelte component lifecycle examples and Astro, Shopify and WordPress guidance when applicable; omit unsupported claims rather than inventing adapters. FrameworkExamples composes shared Tabs/CodeFiles and receives source groups; it must not contain one package's API. CMS examples need single asset loading, independent instances, host lifecycle cleanup and explicit support scope. Compile copied framework files and execute CMS output; Liquid/PHP fixtures are not real hosted deployments.

Use package.npmName for shared header/menu/footer branding and package.name for editorial copy. Preserve Ticker's original Hero compatibility composition: language/host labels with its existing wrapping and gaps. Do not add an unapproved extra Hero CTA merely to link integration guidance; use the existing onboarding/sidebar destinations. Check rendered identity, DOM composition and narrow/enlarged-text geometry as well as style fingerprints.

## Changelog

The release notes are the package's own [`../CHANGELOG.md`](../CHANGELOG.md) — a single source of truth that the documentation app renders. [UPSTREAM.md](UPSTREAM.md) records the reviewed ports and the validation evidence inherited from the template. Record incompatible adaptation or configuration changes explicitly under Breaking changes.

## AI agent skill

For agents integrating Notify, use the public [`../skills/notify/SKILL.md`](../skills/notify/SKILL.md), also served at `/skills/notify/SKILL.md`.

**For website maintenance:** this workspace ships the maintained [package-site skill](.agents/skills/package-site/SKILL.md) as a local file. It carries the full adaptation and maintenance contracts for this website. No global installation is required.

Open a session in the package root and send:

> Use this skill to maintain the landing, examples and complete documentation for this package: .agents/skills/package-site/SKILL.md

The skill records where the package content lives, how the audit is reconciled and which checks gate a release. It is already installed in this workspace, so no download is needed.

### Agent skill inventory

The repository includes the maintained package-site adaptation skill plus ten locally installed upstream skills for the detected stack. See [.agents/README.md](.agents/README.md) for sources, scope and refresh instructions; skills-lock.json records their hashes. Keep upstream files intact, apply only relevant guidance, and retain the root PageSpeed policy when adapting this package.

## License

MIT — [LICENSE.md](LICENSE.md). Bundled font licenses are documented under [shared/assets/fonts/](shared/assets/fonts/).

### Final measurements — 2026-11-04 (Mexico time)

Lighthouse 13.6.0, Chromium 151, Node 26.13.0 and Bun 1.4.4. Production artifacts use identical local HTTP gzip fixtures. The baseline was reconstructed from `5150f4e` after repair work began, with the same website toolchain; the final artifact is the uncommitted working tree on that HEAD. This compares a substantial content expansion, not an isolated performance optimization or a remote deployment.

Mobile: 412 × 823, device scale 1.75, simulated 4× CPU, 150 ms RTT and 1638.4 Kbps. Each mobile result is the median of three fresh-browser, cold-cache runs without concurrent builds or tests. Desktop uses Lighthouse’s explicit desktop config, verified in the reports, with one cold sample per route. Final samples follow the last theme-lifetime fix. The October 31 measurements remain historical.

| Route    | Performance before → final | FCP/LCP before → final | TBT before → final | CLS before → final  | Speed Index before → final | Requests | Transfer before → final |
| -------- | -------------------------- | ---------------------- | ------------------ | ------------------- | -------------------------- | -------- | ----------------------- |
| home     | 100 → 100                  | 0.905 → 0.907 s        | 0 → 0 ms           | 0.000023 → 0.000023 | 0.952 → 1.014 s            | 15 → 15  | 157.2 → 159.1 KiB       |
| examples | 100 → 97                   | 0.905 → 2.105 s        | 0 → 5.5 ms         | 0.000023 → 0.000023 | 0.905 → 2.105 s            | 15 → 15  | 154.3 → 406.8 KiB       |
| docs     | 100 → 100                  | 0.830 → 1.021 s        | 0 → 0 ms           | 0.007072 → 0.000780 | 0.830 → 1.021 s            | 16 → 16  | 147.7 → 165.3 KiB       |

Accessibility, best practices and SEO scored 100 in every final mobile sample and all three desktop checks. Desktop performance is 100 on Home, Examples and Docs. Observed desktop Docs CLS is 0.028842, not zero. No final audit returned an internal error. These lab results do not certify all accessibility or provide real-user Core Web Vitals.

| Route    | Gzip HTML before → final | Gzip JS external before → final | Gzip CSS external before → final | WOFF2    |
| -------- | ------------------------ | ------------------------------- | -------------------------------- | -------- |
| home     | 21.3 → 19.4 KiB          | 26.8 → 30.1 KiB                 | 10.0 → 10.5 KiB                  | 96.4 KiB |
| examples | 18.3 → 267.1 KiB         | 26.8 → 30.1 KiB                 | 10.0 → 10.5 KiB                  | 96.4 KiB |
| docs     | 27.9 → 45.6 KiB          | 20.1 → 20.1 KiB                 | 0.0 → 0.0 KiB                    | 96.4 KiB |

The gallery expands from the original single demonstration to eleven tasks, with statically highlighted ESM/CDN separate and complete files. This explains the transfer and FCP/LCP regression; final mobile performance remains above the 95 target. Copied sources omit unrelated helpers, messages and selectors while retaining all tasks and readable no-JavaScript code. Docs CSS is included in HTML, without counting it twice.

One repeated final navigation per route retained browser storage: Home 100/14 requests/158.8 KiB, Examples 97/14 requests/406.5 KiB, Docs 100/15 requests/164.9 KiB. The fixture sets no cache TTL, so this does not establish a hosting cache improvement. Cache policy and the CSS inlining threshold remain unchanged. Deployed compression, HTTPS and headers were not verified because nothing was published.

The 24 final raw reports (18 cold mobile samples, three repeated and three desktop), medians.json, sizes.json, conditions and fixture are retained outside Git in `notify-audit/second-pass/performance`. Intermediate files are separate and excluded from final medians.

### Controls and visual review — 2026-11-05

The previous visual closure was insufficient: protected component fingerprints did not cover the example-specific form CSS. [The controls review](brief/notify-controls-audit-2026-11-05.md) records the source comparison, defects, repairs and current validation. Preserve native select semantics, reserve logical space for its decorative arrow, use pointer/text/not-allowed cursors by state, and use field surfaces and valid font tokens from the shared theme. Keep useful reading space when text is enlarged; checking outer overflow alone misses a compressed value area. Live previews and copied files share demo-source.ts and demo-styles.css. The release gate also checks the reviewed visual source hashes.

Earlier Lighthouse tables describe their dated artifacts. The latest measurements belong to the controls review; do not quote the earlier gallery score as the current result.

### Controls artifact measurements — 2026-11-05

Lighthouse 13.6.0, Chromium 151, Node 26.13.0 and Bun 1.4.4; identical local HTTP/gzip fixtures. Fresh cold mobile medians (three per route/artifact), 412 × 823, 4× simulated CPU, 150 ms RTT, 1638.4 Kbps, without concurrent builds or tests. Baseline `5150f4e` was reconstructed after work began using the same toolchain; current artifact is the uncommitted working tree. The baseline samples were taken again this date; current samples follow the final enlarged-text padding fix. This includes the expansion from one demonstration to eleven tasks, not an isolated optimization.

| Route    | Performance baseline → current | FCP/LCP baseline → current | TBT        | CLS baseline → current | Speed Index baseline → current | Requests | Transfer baseline → current |
| -------- | ------------------------------ | -------------------------- | ---------- | ---------------------- | ------------------------------ | -------- | --------------------------- |
| home     | 100 → 100                      | 0.905 → 0.907 s            | 0 → 0 ms   | 0.000023 → 0.000023    | 0.926 → 0.917 s                | 15 → 15  | 157.2 → 159.7 KiB           |
| examples | 100 → 95                       | 0.905 → 2.405 s            | 0 → 8.5 ms | 0.000023 → 0.000023    | 0.905 → 2.405 s                | 15 → 15  | 154.3 → 452.8 KiB           |
| docs     | 100 → 100                      | 0.829 → 1.032 s            | 0 → 0 ms   | 0.007072 → 0.000780    | 0.829 → 1.032 s                | 16 → 16  | 147.7 → 169.4 KiB           |

| Route    | Gzip HTML current | Gzip JS external | Gzip CSS external | WOFF2    |
| -------- | ----------------- | ---------------- | ----------------- | -------- |
| home     | 19.4 KiB          | 30.1 KiB         | 11.0 KiB          | 96.4 KiB |
| examples | 312.5 KiB         | 30.1 KiB         | 11.0 KiB          | 96.4 KiB |
| docs     | 49.7 KiB          | 20.1 KiB         | 0.0 KiB           | 96.4 KiB |

Desktop performance is 100 on all three routes (one cold check per route, explicit desktop config). Accessibility, best practices and SEO score 100 in all final mobile and desktop samples. Desktop Docs CLS is 0.028842, not zero. The current gallery score is 95 mobile; its static highlighted complete sources increase transfer and LCP. Do not cite the previous 97 as this artifact’s result. Cache policy and CSS inlining threshold remain unchanged. Three repeated navigations, raw reports, metrics and conditions are retained in controls-review/performance outside Git. These are local lab results, without publication, hosting or field verification.
