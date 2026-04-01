# Notify

A universal toast notification library. Built for teams who need Sonner quality and API, but require seamless integration across multiple frameworks.

Notify is a toast package inspired by [Sonner](https://github.com/emilkowalski/sonner). The intention is to complement that work and experiment with a shared runtime for React, Vue, Svelte, vanilla JS, and browser/CDN usage.

## Table of Contents

- [Installation](#installation)
- [Entrypoints](#entrypoints)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Scripts](#scripts)
- [License](#license)

## Installation

```bash
npm install @samline/notify
```

```bash
bun add @samline/notify
```

## Entrypoints

| Entrypoint                   | Use                   |
| ---------------------------- | --------------------- |
| `@samline/notify`            | Main vanilla API      |
| `@samline/notify/browser`    | Browser global bundle |
| `@samline/notify/react`      | React adapter         |
| `@samline/notify/vue`        | Vue adapter           |
| `@samline/notify/svelte`     | Svelte adapter        |
| `@samline/notify/styles.css` | Shared styles export  |

## Quick Start

```ts
import { createToaster, toast } from '@samline/notify';

createToaster({ position: 'bottom-right', richColors: true });

toast.success('Saved');
```

## Documentation

Use the dedicated docs when you want the full API or a framework-specific guide.

- [docs/README.md](docs/README.md)
- [docs/api.md](docs/api.md)
- [docs/vanilla.md](docs/vanilla.md)
- [docs/browser.md](docs/browser.md)
- [docs/react.md](docs/react.md)
- [docs/vue.md](docs/vue.md)
- [docs/svelte.md](docs/svelte.md)

## License

MIT
