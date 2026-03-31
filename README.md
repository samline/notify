# Notify

A toast notification library powered by Sileo, designed to bring the same beautiful, animated experience to React, Vue, Svelte, and Vanilla JS. Built for teams who need Sileo’s quality and API, but require seamless integration across multiple frameworks.

## Sileo project: [text](https://github.com/hiaaryan/sileo)

## Table of Contents

- [Installation](#installation)
- [CDN / Browser](#cdn--browser)
- [Entrypoints](#entrypoints)
- [Quick Start](#quick-start)
- [What can you do?](#what-can-you-do)
- [General API](#general-api)
- [Minimal Example](#minimal-example)
- [Framework Documentation](#framework-documentation)
- [License](#license)

---

## Installation

```bash
npm install @samline/notify
# React
npm install @samline/notify/react
# Vue
npm install @samline/notify/vue
# Svelte
npm install @samline/notify/svelte
```

---

## CDN / Browser

Include the generated UMD file (`dist/browser-sileo.js`) in your HTML:

```html
<script src="dist/browser-sileo.js"></script>
<script>
  Sileo.show({
    title: 'Hello from the browser',
    type: 'success',
    duration: 2000,
  })
</script>
```

---

## Entrypoints

| Entrypoint                         | Description                        |
| ---------------------------------- | ----------------------------------- |
| @samline/notify                    | VanillaJS API                      |
| @samline/notify/react              | React API (hooks and helpers)      |
| @samline/notify/vue                | Vue API (composable)               |
| @samline/notify/svelte             | Svelte API (store)                 |
| @samline/notify/dist/browser-sileo | Global for Browser/CDN             |

---

## Quick Start

### Import by framework

**VanillaJS (default):**

```js
import { showSileoToast } from '@samline/notify'
showSileoToast({ title: 'Hello world!', type: 'success' })
```

**React:**

```js
import { showSileoToast } from '@samline/notify/react'
showSileoToast({ title: 'Hello from React!', type: 'success' })
```

**Vue:**

```js
import { showSileoToast, useSileoToasts } from '@samline/notify/vue'
showSileoToast({ title: '¡Hola desde Vue!', type: 'success' })
```

**Svelte:**

```js
import { showSileoToast, sileoToasts } from '@samline/notify/svelte'
showSileoToast({ title: '¡Hola desde Svelte!', type: 'success' })
```

**Svelte:**

```js
import { showSileoToast, sileoToasts } from 'notify/svelte'
showSileoToast({ title: '¡Hola desde Svelte!', type: 'success' })
```

Cada framework importa desde su propio contexto, asegurando integración óptima y tipos correctos. Consulta la documentación específica para ejemplos avanzados.

Para ejemplos completos y UI plug-and-play, consulta la documentación de tu framework:

- [React](docs/react.md)
- [Vue 3](docs/vue.md)
- [Svelte](docs/svelte.md)
- [VanillaJS](docs/vanillajs.md)
- [Browser / CDN](docs/browser.md)

---

## ¿Qué puedes hacer?

- Mostrar toasts con animaciones físicas y personalizables
- Usar la misma API en React, Vue, Svelte, VanillaJS y Browser
- Personalizar posición, duración, estilos, iconos y botones
- Integrar UI plug-and-play o crear tu propio renderizado
- Suscribirte a cambios de toasts (store/composable/callback)
- Usar desde bundlers o directamente en HTML

---

## API General

Sileo expone una API unificada para todos los entornos. Todas las opciones y métodos están disponibles en cada integración.

### Opciones de Toast

| Opción      | Tipo                                                                                  | Descripción               |
| ----------- | ------------------------------------------------------------------------------------- | ------------------------- |
| title       | string                                                                                | Título del toast          |
| description | string                                                                                | Descripción opcional      |
| type        | 'success'\|'loading'\|'error'\|'warning'\|'info'\|'action'                            | Tipo de toast             |
| duration    | number                                                                                | Duración en milisegundos  |
| position    | 'top-left'\|'top-center'\|'top-right'\|'bottom-left'\|'bottom-center'\|'bottom-right' | Posición en pantalla      |
| styles      | { title, description, badge, button }                                                 | Clases CSS personalizadas |
| fill        | string                                                                                | Color de fondo            |
| roundness   | number                                                                                | Radio de borde            |
| autopilot   | boolean\|{ expand, collapse }                                                         | Auto expand/collapse      |
| button      | { title: string, onClick: () => void }                                                | Botón de acción           |

### Métodos principales

- `showSileoToast(options)` — Muestra un toast (en todos los entornos)
- `onSileoToastsChange(fn)` — Suscríbete a cambios (VanillaJS)
- `useSileoToasts()` — Composable para Vue
- `sileoToasts` — Store para Svelte

---

## Ejemplo mínimo

```js
showSileoToast({
  title: 'Acción requerida',
  description: 'Haz clic en el botón para continuar',
  type: 'action',
  button: {
    title: 'Continuar',
    onClick: () => alert('¡Continuaste!'),
  },
  styles: {
    title: 'mi-titulo',
    button: 'mi-boton',
  },
  fill: '#fffae0',
  roundness: 24,
  duration: 5000,
})
```

---

## Documentación por framework

- [React](docs/react.md)
- [Vue 3](docs/vue.md)
- [Svelte](docs/svelte.md)
- [VanillaJS](docs/vanillajs.md)
- [Browser / CDN](docs/browser.md)
- [API General](docs/api.md)

---

## Licencia

MIT
