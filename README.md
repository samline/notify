<div align="center">
  <h1>Sileo</h1>
  <p>An opinionated, physics-based toast component for React.</p>
  <p><a href="https://sileo.aaryan.design">Try Out</a> &nbsp; / &nbsp; <a href="https://sileo.aaryan.design/docs">Docs</a></p>
  <video src="https://github.com/user-attachments/assets/a292d310-9189-490a-9f9d-d0a1d09defce"></video>
</div>

### Installation

```bash
npm i sileo
```

### Getting Started

```tsx
import { sileo, Toaster } from "sileo";

export default function App() {
  return (
    <>
      <Toaster position="top-right" />
      <YourApp />
    </>
  );
}
```

For detailed docs, click here: https://sileo.aaryan.design

---

## Documentación por framework

- [VanillaJS](docs/vanillajs.md)
- [Vue 3](docs/vue.md)
- [Svelte](docs/svelte.md)
- [Browser/CDN](docs/browser.md)

---

## API General

La API de Sileo es agnóstica y funciona igual en todos los entornos. Las opciones principales para mostrar un toast son:

```js
{
  title: string, // Título del toast
  description?: string, // Descripción opcional
  type?: 'success' | 'loading' | 'error' | 'warning' | 'info' | 'action',
  duration?: number, // Duración en ms
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right',
  styles?: { title?: string, description?: string, badge?: string, button?: string },
  fill?: string, // Color de fondo
  roundness?: number, // Radio de borde
  autopilot?: boolean | { expand?: number, collapse?: number },
  button?: { title: string, onClick: () => void }
}
```

### Métodos principales

- `showSileoToast(options)` — Muestra un toast (en VanillaJS, Vue, Svelte)
- `onSileoToastsChange(fn)` — Suscríbete a cambios de toasts (VanillaJS)
- `useSileoToasts()` — Composable para Vue
- `sileoToasts` — Store para Svelte

### Opciones dedicadas

Cada framework puede tener utilidades o helpers específicos para su ecosistema. Consulta la documentación de cada uno para ver ejemplos y detalles de integración visual.

---
