<div align="center">
  <h1>Sileo</h1>
  <p><b>Agnostic, physics-based toast notifications for any JS framework or browser.</b></p>
  <p>Unifica la experiencia de notificaciones tipo toast en React, Vue, Svelte, VanillaJS y Browser/CDN con una sola API.</p>
</div>

---

![npm](https://img.shields.io/npm/v/agnostic-sileo)
![Types](https://img.shields.io/badge/types-included-blue)
![License](https://img.shields.io/npm/l/agnostic-sileo)

---

## Tabla de Contenidos

- [Instalación](#instalación)
- [CDN / Browser](#cdn--browser)
- [Entrypoints](#entrypoints)
- [Quick Start](#quick-start)
- [¿Qué puedes hacer?](#qué-puedes-hacer)
- [API General](#api-general)
- [Ejemplo mínimo](#ejemplo-mínimo)
- [Documentación por framework](#documentación-por-framework)
- [Licencia](#licencia)

---

## Instalación

```bash
npm install agnostic-sileo
# o
yarn add agnostic-sileo
# o
pnpm add agnostic-sileo
# o
bun add agnostic-sileo
```

---

## CDN / Browser

Incluye el archivo UMD generado (`dist/browser-sileo.js`) en tu HTML:

```html
<script src="dist/browser-sileo.js"></script>
<script>
  Sileo.show({
    title: 'Hola desde el navegador',
    type: 'success',
    duration: 2000,
  })
</script>
```

---

## Entrypoints

| Entrypoint                        | Descripción             |
| --------------------------------- | ----------------------- |
| agnostic-sileo                    | API principal agnóstica |
| agnostic-sileo/dist/vanilla-sileo | API VanillaJS           |
| agnostic-sileo/dist/vue-sileo     | Composable Vue          |
| agnostic-sileo/dist/svelte-sileo  | Store Svelte            |
| agnostic-sileo/dist/browser-sileo | Global para Browser/CDN |

---

## Quick Start

```js
import { showSileoToast } from 'agnostic-sileo'
showSileoToast({ title: '¡Hola mundo!', type: 'success' })
```

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
