# @samline/notify

<a id="notify"></a>

Accessible, dependency-free toast notifications for JavaScript, TypeScript and plain HTML. Mount one owned toaster at the client root and emit semantic, promise-driven or custom notifications from anywhere.

[Demo](https://samline.github.io/notify/) · [Examples](https://samline.github.io/notify/examples/) · [Documentation](https://samline.github.io/notify/docs/) · [Changelog](CHANGELOG.md)

## Table of contents

- [Installation](#installation)
- [Quick start](#quick-start)
- [HTML / CDN](#html--cdn)
- [Capabilities](#capabilities)
- [API at a glance](#api-at-a-glance)
- [Documentation](#documentation)
- [Changelog](#changelog)
- [AI agent skill](#ai-agent-skill)
- [License](#license)

## Installation

```sh
npm install @samline/notify
```

```sh
pnpm add @samline/notify
```

```sh
bun add @samline/notify
```

Requires Node 20+ when bundling. Runtime target is ES2020.

Import the stylesheet once in your application entrypoint:

```ts
import '@samline/notify/styles.css'
```

## Quick start

Run once at your application's client root, after `document.body` exists. Keep the returned controller: it owns preference updates and cleanup.

```ts
import { createToaster, destroyToaster, toast } from '@samline/notify'
import '@samline/notify/styles.css'

const toaster = createToaster({
  position: 'bottom-right',
  richColors: true,
  closeButton: true,
  theme: 'system'
})

toast.success('Changes saved')
toast.error('Could not save', { description: 'Check your connection and try again.' })

toaster.update({ position: 'top-center' })
// When the owning application or page leaves:
destroyToaster()
```

What this does:

- Mounts a singleton toaster (one per page) with the position, color treatment and theme you requested. Calling `createToaster()` again updates the same instance.
- Renders each notification as native DOM inside a labelled live region; actions and close buttons are real `button` elements.
- Lets the stylesheet own layout, stacking and appearance through data attributes, while the renderer supplies measured geometry through CSS custom properties. No shadow DOM.
- Pauses a toast's timer while it is hovered or focused, and every timer while the document is hidden, then resumes from the remaining time.
- Keeps `toaster.update()` partial: omitted options remain unchanged.
- Disposes the renderer and dismisses active notifications when `destroyToaster()` runs.

Root and module imports are safe without a DOM; mounting is client-only. See the [toast lifecycle guide](https://samline.github.io/notify/docs/guides/toast-lifecycle/) for remounting and lower-level controller ownership.

## HTML / CDN

<a id="cdn--browser"></a>

Choose **Package / ESM** when installing with npm, pnpm or bun and importing Notify in your application. Choose **HTML / CDN** when loading the standalone script in plain HTML, WordPress or Shopify without a bundler. Both use the same toast API. A CDN only delivers the files; you can self-host the same script and stylesheet.

```html
<link rel="stylesheet" href="https://unpkg.com/@samline/notify@4.0.0/dist/styles.css" />
<script src="https://unpkg.com/@samline/notify@4.0.0/dist/browser/global.global.js"></script>
```

> Pin the version in production. Replace `4.0.0` with the version you ship.

The standalone script (an IIFE) exposes `window.Notify` and auto-mounts a default toaster once, so the first call has somewhere to render. The optional `@samline/notify/browser` registry module is an ESM/CJS import; it does not install that object or auto-mount.

```html
<button id="save" type="button">Save</button>

<script>
  const notify = window.Notify

  notify.createToaster({ position: 'top-center', richColors: true })
  document.querySelector('#save').addEventListener('click', () => {
    notify.toast.success('Saved')
  })
</script>
```

`createToaster(options)` updates the auto-mounted toaster; after `destroyToaster()`, remount explicitly. See [Browser integration](https://samline.github.io/notify/docs/reference/browser/) for the complete registry, base paths and Content Security Policy notes.

## Capabilities

<a id="what-you-can-build"></a>

- Action confirmations ("Saved", "Copied to clipboard", "Email sent") with auto-dismiss.
- Async feedback with `toast.promise()` for fetches, uploads and any other `Promise` flow.
- Progress that reuses one toast id from loading to its terminal state.
- Undo and retry flows through native `action` and `cancel` buttons.
- Rich per-toast content through `toast.custom(element)` or a factory, without JSX.
- Light, dark and system themes, rich colors, RTL and keyboard shortcuts.
- Browser-global integrations for WordPress, Shopify and plain HTML.

[Working examples](https://samline.github.io/notify/examples/) cover semantic variants, promises, cancellation, actions, editable custom content and stack interaction. [Framework integrations](https://samline.github.io/notify/docs/guides/frameworks/) covers React, Vue, Svelte and SSR using this same API.

### Actions and custom content

Strings are rendered as text. `action` closes the toast unless `closeOnClick` is false or `onClick` calls `event.preventDefault()`; `cancel` renders before it. Use a label that names the result, such as `Undo deletion`.

```ts
toast('Message archived', {
  action: { label: 'Undo archive', onClick: () => console.log('restore') },
  duration: 6000
})
```

Custom factories can run again after controller updates: keep draft state outside the factory and release listeners on replacement or dismissal. Never put an `aria-label` on a toast item; it would replace its description, actions and content for assistive technology. See [actions and custom content](https://samline.github.io/notify/docs/guides/actions-and-custom-content/) and [accessibility](https://samline.github.io/notify/docs/guides/accessibility/).

## API at a glance

| API                                                                                                                                                                                                                                                                                                                                                                                                              | Purpose             |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| [`toast()`](https://samline.github.io/notify/docs/api/toast/)                                                                                                                                                                                                                                                                                                                                                    | Toast factory       |
| [`success()` · `error()` · `info()` · `warning()` · `loading()` · `message()`](https://samline.github.io/notify/docs/api/toast/#toastvariants)                                                                                                                                                                                                                                                                   | Toast variants      |
| [`toast.custom()`](https://samline.github.io/notify/docs/api/toast/#toastcustom) · [`toast.promise()`](https://samline.github.io/notify/docs/api/toast/#toastpromise)                                                                                                                                                                                                                                            | Content and async   |
| [`toast.dismiss()`](https://samline.github.io/notify/docs/api/toast/#toastdismiss) · [`toast.getToasts()`](https://samline.github.io/notify/docs/api/toast/#toastgettoasts) · [`toast.getHistory()`](https://samline.github.io/notify/docs/api/toast/#toastgethistory)                                                                                                                                           | Dismissal and state |
| [`createToaster()`](https://samline.github.io/notify/docs/api/create-toaster/) · [`getToaster()`](https://samline.github.io/notify/docs/api/get-toaster/) · [`configureToaster()`](https://samline.github.io/notify/docs/api/configure-toaster/) · [`destroyToaster()`](https://samline.github.io/notify/docs/api/destroy-toaster/) · [`resetToasts()`](https://samline.github.io/notify/docs/api/reset-toasts/) | Toaster lifecycle   |
| [`ToasterOptions` and `ToastOptions`](https://samline.github.io/notify/docs/reference/configuration/)                                                                                                                                                                                                                                                                                                            | Configuration       |
| [`mountToaster()`, `ToastState` and runtime contract](https://samline.github.io/notify/docs/reference/runtime-contract/)                                                                                                                                                                                                                                                                                         | Advanced rendering  |
| [TypeScript reference](https://samline.github.io/notify/docs/reference/typescript/)                                                                                                                                                                                                                                                                                                                              | Types               |

The controller exposes `element` and an `options` snapshot. `update(options?)` is chainable and partial; `destroy()` removes that renderer, while `destroyToaster()` also dismisses active notifications. Direct `mountToaster()` calls share the default `ToastState` unless you supply another one, so separate containers are not independent channels.

See the complete [API reference](https://samline.github.io/notify/docs/reference/api/).

### Entrypoints

| Entrypoint                                 | When to use                                                     |
| ------------------------------------------ | --------------------------------------------------------------- |
| `@samline/notify`                          | Main API, browser registry singleton, types and constants.      |
| `@samline/notify/browser`                  | ESM/CJS browser registry without a global side effect.          |
| `dist/browser/global.global.js` (CDN file) | Pre-bundled IIFE that installs `window.Notify` and auto-mounts. |
| `@samline/notify/styles.css`               | Required layout, stacking, theme and motion styles.             |

The main entrypoint also exports `browser` and its `Notify` alias: the same `{ toast, Toaster, createToaster, configureToaster, getToaster, destroyToaster }` registry as the standalone script, without installing `window.Notify`. See [Entrypoints](https://samline.github.io/notify/docs/reference/entrypoints/).

### Async feedback

Continue from the Quick start with your application's promise. This example expects `/api/profile` to return JSON containing a name; replace that endpoint with your own.

```ts
async function fetchProfile(): Promise<{ name: string }> {
  const response = await fetch('/api/profile')
  if (!response.ok) throw new Error('Could not load profile')
  return response.json()
}

const result = toast.promise(fetchProfile(), {
  loading: 'Loading profile…',
  success: (profile) => `Hi ${profile.name}`,
  error: 'Could not load profile'
})

const profile = await result.unwrap()
```

`toast.promise()` updates one id when a loading message is supplied. `unwrap()` preserves the original outcome; a fulfilled non-ok HTTP response can show the error state while still fulfilling. Cancellation belongs to the application. See the [promise contract](https://samline.github.io/notify/docs/reference/promises/) and [examples](https://samline.github.io/notify/docs/guides/examples/).

## Documentation

Read the [documentation](https://samline.github.io/notify/docs/) for the full guides and API contracts, and explore [working examples](https://samline.github.io/notify/examples/) with complete and separate source files for both loading modes.

| Guide                                                                                                  | What it covers                                                         |
| ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| [Getting started](https://samline.github.io/notify/docs/getting-started/)                              | Installation, stylesheet, first notification and ownership.            |
| [Toast lifecycle](https://samline.github.io/notify/docs/guides/toast-lifecycle/)                       | Singleton mounting, updates, remounting and teardown.                  |
| [Configuration](https://samline.github.io/notify/docs/reference/configuration/)                        | Every toaster and toast option, default and inheritance rule.          |
| [Promises](https://samline.github.io/notify/docs/reference/promises/)                                  | Complete `toast.promise()` behavior, HTTP values and `unwrap()`.       |
| [Actions and custom content](https://samline.github.io/notify/docs/guides/actions-and-custom-content/) | Action buttons, custom DOM factories and listener cleanup.             |
| [Browser integration](https://samline.github.io/notify/docs/reference/browser/)                        | `window.Notify`, the module registry, hosting and CSP.                 |
| [Entrypoints](https://samline.github.io/notify/docs/reference/entrypoints/)                            | ESM, CommonJS, registries, the standalone IIFE and stylesheet loading. |
| [Styling](https://samline.github.io/notify/docs/reference/css-styling/)                                | Data-attribute contract, classes and CSS custom properties.            |
| [Accessibility](https://samline.github.io/notify/docs/guides/accessibility/)                           | Semantics, keyboard controls, timing and accessible content.           |
| [Framework integrations](https://samline.github.io/notify/docs/guides/frameworks/)                     | Lifecycle-safe React, Vue, Svelte and SSR patterns.                    |
| [TypeScript](https://samline.github.io/notify/docs/reference/typescript/)                              | Exported TypeScript types and their roles.                             |
| [Troubleshooting](https://samline.github.io/notify/docs/reference/troubleshooting/)                    | Mounting, CSS, duplicate renderers, CDN, CSP and teardown fixes.       |
| [API reference](https://samline.github.io/notify/docs/reference/api/)                                  | Factory variants, singleton lifecycle, state and low-level rendering.  |

## Changelog

Read [CHANGELOG.md](CHANGELOG.md) or the [published changelog](https://samline.github.io/notify/docs/changelog/) for release history and explicitly marked breaking and behavior changes. Review the notes before upgrading.

### Upgrading to v4

V4 exposes the registry directly as `window.Notify` (3.2.0 and earlier wrapped it in a namespace), dispatches `onDismiss` once from shared state regardless of how many toasters are mounted, and changes the custom-content DOM. See [CHANGELOG.md](CHANGELOG.md) before upgrading 3.x code.

## AI agent skill

<a id="agent-integration"></a>

The public [Notify skill](https://samline.github.io/notify/skills/notify/SKILL.md) teaches an agent how to mount one owned toaster, load CSS, match feedback to the task, manage custom content and clean up without inventing APIs. It is self-contained and describes v4.0.0; agents must verify their installed version.

The maintained [repository source](skills/notify/SKILL.md) and website download are the same file.

Download [SKILL.md](https://samline.github.io/notify/skills/notify/SKILL.md) into a `notify/` folder in your agent's supported skill directory. For agents that discover project skills from `.agents/skills/`:

```sh
mkdir -p .agents/skills/notify
curl --fail --location https://samline.github.io/notify/skills/notify/SKILL.md \
  --output .agents/skills/notify/SKILL.md
```

When working from this repository, copy `skills/notify/SKILL.md` instead. Keep the filename `SKILL.md`; discovery paths and invocation syntax depend on the agent.

## License

MIT — [LICENSE.md](LICENSE.md).
