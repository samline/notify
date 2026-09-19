# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
Dates for published releases are the UTC publication dates reported by npm. Versions
marked as unpublished have a Git tag but are not present in the npm registry.

## [3.1.3] - Unpublished

### Added

- Added package smoke tests for ESM, CommonJS, browser, IIFE, CSS, and early DOM loading.
- Added coverage thresholds and a root continuous integration workflow.
- Added a dedicated ESM/CommonJS `@samline/notify/browser` entry point.

### Changed

- Updated the test and build toolchain, package metadata, documentation, and CDN examples.
- Improved keyboard interaction, reduced-motion behavior, decorative icon semantics, and close-button sizing.

### Fixed

- Kept numeric and string toast IDs distinct and prevented explicit IDs from colliding with generated IDs.
- Preserved timer deadlines across hover, focus, visibility changes, updates, and rerenders.
- Made partial toaster updates preserve omitted layout and theme settings.
- Refreshed callbacks, content, actions, classes, test IDs, and accessibility labels on same-ID updates.
- Corrected same-ID recreation during exit transitions and from dismissal callbacks.
- Ensured description factories run once and `toast.promise().unwrap()` preserves the original result.
- Deferred browser-global mounting until the document body is available.
- Declared CSS and the IIFE bundle as package side effects.

## [3.1.2] - Unpublished

### Fixed

- Preserved the configured exit duration instead of truncating exit transitions.
- Applied dynamic toast gaps consistently during layout updates.

## [3.1.1] - 2026-07-14

### Fixed

- Allowed exit animations to complete for their full duration.
- Prevented hover movement from causing repeated rerenders.
- Applied configured gaps while the toast stack is expanded.
- Restored the `data-swipe-out` state used by dismissal animations.

## [3.1.0] - 2026-07-14

### Added

- Added toaster hotkeys and focus restoration.
- Added accessibility behavior and labels across the toast lifecycle.

### Changed

- Preserved remaining timer duration when toast activity pauses and resumes.

### Fixed

- Restored five missing configuration options and corrected regressions from the vanilla runtime rewrite.

## [3.0.0] - 2026-07-14

### Changed

- Rebuilt the package as a framework-agnostic TypeScript toast runtime.
- Replaced framework-specific adapters with a vanilla/browser API and direct IIFE bundle.
- Moved the build to tsup with ESM, CommonJS, declarations, CSS, and browser outputs.
- Raised the supported Node.js version to 20.

### Removed

- Removed React, Vue, and Svelte runtime dependencies and framework-specific entry points.

## [2.0.3] - 2026-04-08

### Fixed

- Corrected the package author metadata.

## [2.0.2] - 2026-04-08

### Added

- Added a profile-saving `toast.promise` example.

### Changed

- Hardened the distribution copy/build script.
- Standardized source formatting and refreshed API and browser documentation.

### Fixed

- Corrected browser documentation examples and syntax.

## [2.0.1] - 2026-04-01

### Fixed

- Corrected the browser bundle release and its loading instructions.

## [2.0.0] - 2026-04-01

### Added

- Added dedicated React, Vue, Svelte, Vanilla, and browser entry points.
- Added Vue plugin/component support and Svelte integration.
- Added a build pipeline for copying the complete distribution package.

### Changed

- Reorganized the package around a shared notification core and framework adapters.
- Renamed the package and internal references to `@samline/notify`.
- Replaced Playwright/Jest-era setup with Vitest coverage for the package adapters.

## [1.0.2] - 2026-04-01

### Added

- Added a browser renderer and the styles required for CDN usage.

### Fixed

- Corrected generated browser entry points and exports.

## [1.0.1] - 2026-04-01

### Changed

- Standardized the browser global as `window.notify` and updated the documentation.

### Fixed

- Corrected method names in the global `Window` interface.

## [1.0.0] - 2026-04-01

### Added

- Added a unified notification API for React, Vue, Svelte, and Vanilla JavaScript.
- Added framework entry points, lifecycle cleanup, tests, and English documentation.
- Added npm publication automation with tag/version validation.

### Changed

- Consolidated the package under the `@samline/notify` name.
- Removed obsolete Sileo files and tests.

## [0.3.0] - 2026-03-31

### Changed

- Simplified the experimental gooey visuals and removed the temporary demo assets.
- Updated package and CDN documentation for the minor release.

## [0.2.7] - 2026-03-31

### Changed

- Simplified SVG gooey-filter markup and visual styling across framework adapters.

## [0.2.6] - 2026-03-31

### Changed

- Refined gooey filters, layered shadows, and the left accent treatment.

## [0.2.5] - 2026-03-31

### Added

- Added gooey SVG effects and runnable React, Vue, Svelte, and Vanilla demos.

### Changed

- Expanded the visual treatment and adapter implementations for the new effects.

## [0.2.3] - 2026-03-30

### Added

- Added centered top and bottom toaster positions.

## [0.2.2] - 2026-03-30

### Changed

- Reworked Vanilla fallback behavior and clarified bundler/CDN usage in the documentation.
- Updated the documentation to English.

### Fixed

- Removed warnings caused by uninitialized toast positions.
- Added jsdom coverage for the Vanilla toaster manager.

## [0.2.0] - 2026-03-30

### Added

- Expanded notification options and API parity across React, Vue, Svelte, and Vanilla adapters.
- Added comprehensive usage, configuration, promise, action, and lifecycle examples.
- Added tests for the expanded core and Vanilla APIs.

## [0.1.15] - 2026-03-28

### Changed

- Unified and clarified the public API documentation for every framework adapter.

### Fixed

- Made `NotifyController` members public to prevent TypeScript declaration error TS4094.

## [0.1.10] - 2026-03-28

### Fixed

- Corrected the UMD browser bundle and synchronized browser documentation.

## [0.1.9] - 2026-03-28

### Changed

- Synchronized CDN links and documentation for the published package.

## [0.1.8] - 2026-03-27

### Fixed

- Corrected UMD output for direct browser compatibility.
- Updated browser examples and package metadata for CDN consumers.

## [0.1.7] - 2026-03-27

### Changed

- Updated npm publication automation and tag/version validation.

## [0.1.6] - 2026-03-27

### Fixed

- Migrated the Rollup configuration to ESM so package builds could run under `type: module`.
- Corrected npm authentication and publication workflow setup.
- Added the npm package inclusion/exclusion rules used by releases.

## [0.1.1] - 2026-03-27

### Changed

- Republished after a registry conflict on `0.1.0`; no functional changes.

## [0.1.0] - 2026-03-27

### Added

- Published the first `@samline/notify` release with React, Vue, Svelte, Vanilla, and UMD adapters.
- Added `dist/styles.css` to the build output.

### Changed

- Renamed the internal controller and package from Sileo to Notify.
- Exposed `window.notify` while retaining the previous browser global as a compatibility alias.

[3.1.3]: https://github.com/samline/notify/compare/v3.1.2...v3.1.3
[3.1.2]: https://github.com/samline/notify/compare/v3.1.1...v3.1.2
[3.1.1]: https://github.com/samline/notify/compare/v3.1.0...v3.1.1
[3.1.0]: https://github.com/samline/notify/compare/87ab1ac...v3.1.0
[3.0.0]: https://github.com/samline/notify/commit/87ab1ac
[2.0.3]: https://github.com/samline/notify/compare/v2.0.2...v2.0.3
[2.0.2]: https://github.com/samline/notify/compare/v2.0.1...v2.0.2
[2.0.1]: https://github.com/samline/notify/compare/2.0.0...v2.0.1
[2.0.0]: https://github.com/samline/notify/commit/a74bfc5
[1.0.2]: https://github.com/samline/notify/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/samline/notify/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/samline/notify/compare/v0.3.0...v1.0.0
[0.3.0]: https://github.com/samline/notify/compare/v0.2.7...v0.3.0
[0.2.7]: https://github.com/samline/notify/compare/v0.2.6...v0.2.7
[0.2.6]: https://github.com/samline/notify/compare/v0.2.5...v0.2.6
[0.2.5]: https://github.com/samline/notify/compare/v0.2.3...v0.2.5
[0.2.3]: https://github.com/samline/notify/compare/v0.2.2...v0.2.3
[0.2.2]: https://github.com/samline/notify/compare/v0.2.0...v0.2.2
[0.2.0]: https://github.com/samline/notify/compare/v0.1.15...v0.2.0
[0.1.15]: https://github.com/samline/notify/compare/v0.1.10...v0.1.15
[0.1.10]: https://github.com/samline/notify/compare/v0.1.9...v0.1.10
[0.1.9]: https://github.com/samline/notify/compare/v0.1.8...v0.1.9
[0.1.8]: https://github.com/samline/notify/compare/v0.1.7...v0.1.8
[0.1.7]: https://github.com/samline/notify/compare/v0.1.6...v0.1.7
[0.1.6]: https://github.com/samline/notify/compare/v0.1.1...v0.1.6
[0.1.1]: https://github.com/samline/notify/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/samline/notify/commit/ff8cfff
