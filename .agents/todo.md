# TODO

## Completado — 2026-10-31

- Corregido para 3.2.1 el global IIFE: el bundle conserva el registro asignado por `src/browser/global.ts`. Pruebas de script clásico en Chromium y JSDOM evitan que `eval()` oculte la regresión.
- Sitio, documentación canónica, ejemplos e integraciones reconciliados. (Histórico: superado por 4.0.0, cuyo CDN expone `window.Notify` directamente.)

## Resuelto — publicación

- 3.2.1 nunca se publicó: su contenido se integró en 4.0.0 (publicada el 2026-11-05).

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
- Versión decidida y publicada: 4.0.0 (major).

## Publicación 4.0.0 — 2026-11-05

- `@samline/notify@4.0.0` publicado en npm (tag `latest`) y disponible en jsDelivr/unpkg; los archivos CDN coinciden con el build local. El sitio depende de `^4.0.0`.

## CI — 2026-11-05

- La suite de navegador corre en tres proyectos de Playwright (`files`, `scenarios`, `site`) como matriz de CI; Chromium se instala sin `--with-deps`. CI total ≈ 3,3 min (antes ≈ 8 min). Si una suite crece, volver a medir con `--reporter=json` y reequilibrar los proyectos.

## Pendiente

- Resuelto el fallo intermitente de e2e/power.spec.ts: a 320px y texto al 200%, la tarjeta custom persistente podía cubrir el reset de la página. La prueba usa ahora el botón Close release receipt antes del reset, sin force clicks, retries ni aumentos de timeout. El caso pasó cinco veces seguidas y el proyecto completo de 22 escenarios pasó después.

## Cierre del handoff — 2026-11-06

- Docs muestra los ejemplos con su código; la fuente Markdown, el generador y el MDX coinciden. El hash de revisión de docs/recipes.md se actualizó tras revisar el cambio.
- Header y Logo sincronizados con la corrección 61cc0d8 de la plantilla; nueva regresión de Home, Examples y Docs a 1024–1440 px. La prueba reproduce el fallo anterior a 1024 px.
- Verificación completa del sitio: checks de Astro e integraciones, formato, ocho pruebas de herramientas, dos bases alternativas, build con 2.182 enlaces y auditoría de migración; 78/78 pruebas de navegador aprobadas. check:release también pasa.
- Cambios solo del sitio y documentación: no requieren una nueva publicación npm.

## Seguimiento de CI — 2026-11-06

El CI del primer push reprodujo el bloqueo de puntero descrito arriba. La tarjeta custom conserva su cierre propio; el recorrido de la prueba lo usa antes de resetear el preview subyacente. La corrección no cambia el paquete ni el sitio. Verificación: cinco repeticiones del caso en ambos temas y 22/22 escenarios; el build y los otros proyectos ya habían pasado para el mismo sitio.
