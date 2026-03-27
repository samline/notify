# Vanilla
## Quick Start

Importa y inicializa el renderer vanilla (DOM):

```ts
import { notify, sileo, initToasters } from '@samline/notify/vanilla';

// monta el contenedor (por defecto document.body)
initToasters(document.body, ['top-right']);

// muestra una notificación (usar `notify(...)` es la forma recomendada)
notify({ title: 'Guardado', description: 'Tus cambios fueron guardados', type: 'success' });
```

## API

```ts
// core controller (principal: `notify`, alias: `sileo`)
notify.show(options)
notify.dismiss(id)
notify.clear()
notify.promise(promise, { loading, success, error })
```

### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `options` | object | Toast creation options (see Options below) |

### Returns

`string | void` — `show` returns a toast id when created.

## Options

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | Toast title |
| `description` | `string` | — | Optional body text |
| `type` | `info\|success\|error\|warning` | `info` | Visual intent |
| `position` | `string` | `top-right` | Container position |
| `duration` | `number` | `4000` | Auto-dismiss timeout in ms (0 = persistent) |
| `button` | `{ title, onClick }` | — | Optional action button |

## Examples

### Basic

```ts
import { notify, initToasters } from '@samline/notify/vanilla';
initToasters();
notify.success({ title: 'Saved' });
```

### Promise flow

```ts
notify.promise(fetch('/api/save'), {
	loading: { title: 'Guardando...' },
	success: { title: 'Listo', type: 'success' },
	error: { title: 'Error', type: 'error' }
});
```

## When to use

Use the vanilla entry when you work directly with DOM nodes or need a framework-agnostic API.

## Accessibility

Toaster containers use `role="status"` and `aria-live="polite"` by default.
