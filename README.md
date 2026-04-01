# Notify

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
npm install @samline/sonner
```

```bash
bun add @samline/sonner
```

## Entrypoints

| Entrypoint                   | Use                   |
| ---------------------------- | --------------------- |
| `@samline/sonner`            | Main vanilla API      |
| `@samline/sonner/browser`    | Browser global bundle |
| `@samline/sonner/react`      | React adapter         |
| `@samline/sonner/vue`        | Vue adapter           |
| `@samline/sonner/svelte`     | Svelte adapter        |
| `@samline/sonner/styles.css` | Shared styles export  |

## Quick Start

```ts
import { createToaster, toast } from '@samline/sonner';

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
