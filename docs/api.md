# API General de Sileo

La API de Sileo es común para todos los entornos y frameworks. Aquí se describen todas las opciones y métodos disponibles.

## Opciones de Toast

| Opción       | Tipo                                                        | Descripción                                 |
|--------------|-------------------------------------------------------------|---------------------------------------------|
| title        | string                                                      | Título del toast                            |
| description  | string                                                      | Descripción opcional                        |
| type         | 'success' \| 'loading' \| 'error' \| 'warning' \| 'info' \| 'action' | Tipo de toast                               |
| duration     | number                                                      | Duración en milisegundos                    |
| position     | 'top-left' \| 'top-center' \| 'top-right' \| 'bottom-left' \| 'bottom-center' \| 'bottom-right' | Posición en pantalla                        |
| styles       | { title, description, badge, button }                       | Clases CSS personalizadas                   |
| fill         | string                                                      | Color de fondo                              |
| roundness    | number                                                      | Radio de borde                              |
| autopilot    | boolean \| { expand, collapse }                             | Control de auto-expand/collapse             |
| button       | { title: string, onClick: () => void }                      | Botón de acción                             |

## Métodos principales

- `showSileoToast(options)` — Muestra un toast (VanillaJS, Vue, Svelte)
- `onSileoToastsChange(fn)` — Suscríbete a cambios de toasts (VanillaJS)
- `useSileoToasts()` — Composable para Vue
- `sileoToasts` — Store para Svelte

## Ejemplo completo

```js
showSileoToast({
  title: 'Acción requerida',
  description: 'Haz clic en el botón para continuar',
  type: 'action',
  button: {
    title: 'Continuar',
    onClick: () => alert('¡Continuaste!')
  },
  styles: {
    title: 'mi-titulo',
    button: 'mi-boton'
  },
  fill: '#fffae0',
  roundness: 24,
  duration: 5000
});
```

Para detalles y ejemplos visuales, consulta la documentación específica de cada framework.
