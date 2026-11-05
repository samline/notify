# TODO

## Completado — 2026-10-31

- Corregido para 3.2.1 el global IIFE: el bundle conserva el registro asignado por `src/browser/global.ts`. Pruebas de script clásico en Chromium y JSDOM evitan que `eval()` oculte la regresión.
- Sitio, documentación canónica, ejemplos e integraciones reconciliados. Mantener CDN 3.2.0 con `window.Notify.default ?? window.Notify` hasta una publicación autorizada; 3.2.1 está preparado, sin publicar.

## Pendiente de autorización independiente

- Publicar 3.2.1 y desplegar el sitio solo cuando el mantenedor lo solicite explícitamente. Después, verificar artefactos remotos y actualizar el pin CDN.

## Segunda revisión — 2026-11-04

- Se amplían los flujos por capacidad y resultado, con decisiones encadenadas, CSV cancelable, stack activo y formulario custom editable. Matriz y evidencia: site/brief/notify-second-pass-2026-11-04.md.
- Se corrigen regresiones adicionales de width, posición/swipe, edición, cancelación de puntero, duración oculta y lectura con dos acciones. 3.2.1 sigue preparado sin publicar.

- Segunda pasada: corregidos también contraste de las cuatro variantes rich-color claras, narrowing de eventos en recetas y favicon de Docs en desarrollo. Mantener las regresiones de notificaciones abiertas y las recetas tipadas como gates.

- Cierre de la segunda pasada: 178 pruebas del paquete, 69 de navegador y 21 snippets tipados aprobados; informe y mediciones actuales en site/brief/notify-second-pass-2026-11-04.md. El cambio de tema conserva el plazo restante de los previews. Preview combinado en 4330 para revisión; publicación sigue pendiente de petición explícita.

## Revisión visual de controles — 2026-11-05

- Corregidos select nativo/flecha/cursores, superficies de campos, checkbox, foco/hover/disabled, tipografía y scroll del editor custom. Evidencia y cierre de pruebas: site/brief/notify-controls-audit-2026-11-05.md. No reutilizar como actuales los conteos o métricas de la segunda pasada.

## Auditoría completa — 2026-11-05

- Paquete: `onDismiss` único desde el estado, historial limitado (`HISTORY_LIMIT` = 50), dismiss de ids inexistentes sin efecto, descripción de promesa como función también en éxito, sin `aria-label` en los toasts, swipe vertical en posiciones centradas, umbral de flick de 10 px, sin `onClick` tras un arrastre, Delete/Backspace por toaster, rescate de foco, `preventDefault()` en acciones, `ResizeObserver`, contexto y cleanup en `toast.custom()`, contraste de descripciones invertidas. 190 pruebas.
- Sitio: panel "Toast types" como primera pestaña de Home, diagrama esquemático por ejemplo (paridad con Drawer), portada de Docs reescrita con tarjetas (`<!-- notify:cards -->` en docs/README.md), FAQ/copy sin la nota de `Notify.default`. 75 pruebas de navegador.
- Pendiente de decisión del mantenedor: versión de publicación (los cambios de comportamiento listados en CHANGELOG justifican major o minor), y publicar/desplegar.
