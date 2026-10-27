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

The template is configured through files and commands; it does not provide a package runtime API.

### Where to edit

| Input                                                                                     | Owner                                                 |
| ----------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Name, npm name, version, description, URLs, theme storage namespace and two accent colors | `project.config.json`                                 |
| Landing copy, FAQ and navigation                                                          | `landing/src/i18n/translations/en/`                   |
| Shared control messages and neutral demo source                                           | `shared/i18n/translations/en/`                        |
| Docs shell messages and page labels                                                       | `docs/src/i18n/translations/en/`                      |
| Guides, references and MDX compositions                                                   | `docs/src/content/docs/`                              |
| Single release-note source                                                                | `CHANGELOG.md`, loaded into the collection            |
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

Start with [ADAPTATION.md](ADAPTATION.md). Maintenance conventions live in [AGENTS.md](AGENTS.md); the committed visual reference is recorded in [REFERENCE.md](REFERENCE.md).

### Checks

```sh
npm exec -- playwright install chromium
npm run verify
```

This runs configuration/contrast checks, both Astro checks, formatting, unit tests, alternate-package builds at root and nested bases, combined build/link validation and browser tests. Browser tests cover shared typography/highlighting, exact copying and reset, executable separate/complete files, repeated previews, responsive/enlarged text, both themes, search, ToC, drawer focus/scroll and no JavaScript. Run `npm run check:release` as well for an adapted package.

### Deploy

The workflows under `.github/workflows/` validate changes and publish **one** Pages artifact. Set GitHub Pages to **GitHub Actions**, set `site.url` to the actual public root, then run the Deploy workflow. Deployment is opt-in; add a main push trigger only when the new package site is ready. Both a repository base (`/my-package/`) and a domain root (`/`) are supported; Docs always lives below the configured root at `docs/`. Never hardcode the old template base in links, search paths, metadata, tests or redirects.

This repository is a private npm workspace (`private: true`) and is not intended for npm publication. When embedded in a public package, preserve its runtime-only `files` allowlist and exclude all website/tooling directories from npm. [LICENSE.md](LICENSE.md) covers the theme; bundled font licenses are under `shared/assets/fonts/` and included in the generated font-licenses directory.

Reviewed upstream changes and their template equivalents are recorded in [UPSTREAM.md](UPSTREAM.md). Website fonts use local WOFF2; social rendering retains separate TTF inputs. Component scripts use function setup with shared lifecycle cleanup, and code copying reads the live highlighted source. The shared build policy inlines small CSS while keeping larger styles cacheable.

### Performance validation

The permanent policy is the [PageSpeed performance contract](AGENTS.md#pagespeed-performance-contract), shared by Home, Examples and Docs. Every adaptation retains that policy and measures its own production artifact. Targets are at least 95 mobile performance, 100 desktop and 100 accessibility/best practices/SEO after adaptation; they are goals, not results. Starter mode deliberately remains noindex.

Record the commit/dirty state, date, route, browser/Lighthouse versions, device, throttling and cache state, then compare medians from at least three equivalent cold mobile runs before/after a performance change. Track FCP/LCP/TBT/CLS/Speed Index, compressed HTML/CSS/JS/fonts, requests and repeat navigation. Measure a representative article separately from Home and Examples. Use the same environment and avoid concurrent builds/tests while timing.

The upstream ports passed configuration, type, source convention, build/link and browser regressions; these checks are not PageSpeed measurements. No new Lighthouse/PageSpeed score was collected for this template during synchronization. Ticker's dated measurements remain upstream evidence. After an authorized deployment, verify its exact commit and live assets before recording HTTPS mobile/desktop scores. Missing field data and failed diagnostics stay unknown.

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

**For agents:** this workspace ships the maintained [package-site skill](.agents/skills/package-site/SKILL.md) as a local file. It carries the full adaptation and maintenance contracts for this website. No global installation is required.

Open a session in the package root and send:

> Use this skill to maintain the landing, examples and complete documentation for this package: .agents/skills/package-site/SKILL.md

The skill records where the package content lives, how the audit is reconciled and which checks gate a release. It is already installed in this workspace, so no download is needed.

### Agent skill inventory

The repository includes the maintained package-site adaptation skill plus ten locally installed upstream skills for the detected stack. See [.agents/README.md](.agents/README.md) for sources, scope and refresh instructions; skills-lock.json records their hashes. Keep upstream files intact, apply only relevant guidance, and retain the root PageSpeed policy when adapting this package.

## License

MIT — [LICENSE.md](LICENSE.md). Bundled font licenses are documented under [shared/assets/fonts/](shared/assets/fonts/).
