# Notify: segunda pasada — 2026-11-04

> El cierre visual de esta pasada fue insuficiente. La [revisión de controles del 5 de noviembre](notify-controls-audit-2026-11-05.md) documenta los fallos señalados por el usuario y su reparación. Estas mediciones y conteos corresponden al artefacto de esta segunda pasada.

## Criterio de aceptación

La primera revisión fue insuficiente: el número de demos, el inventario de exports y una suite verde no demostraban profundidad de uso ni buena lectura visual. Esta pasada revisa capacidad → tarea → resultado observable → fuente copiada → ciclo de vida, además de la presentación real. Este documento sustituye el dictamen de finalización de la primera pasada; sus mediciones quedan como registro histórico.

Referencias consultadas: Ticker, commit visual fijado 8a30c9ca8486953fdc2801f0ceff8b17d0cb5615 y checkout ed94f25d7c9d0dda86f5904dbeff9d6e35935223; Drawer, f45182f01d39a78aec3e084e33370f7f81795e85. Se conservaron geometría, tipografía, controles, divisores, fuentes y componentes compartidos. Drawer aporta el criterio de flujos con contexto y resultado persistente: selección, revisión, confirmación y composición. No se copiaron sus APIs a Notify.

## Dictamen y comparación

Conviene conservar la infraestructura de la plantilla y continuar sobre esta reparación. La galería y la adaptación editorial se rehicieron de forma sustancial; también se corrigieron defectos del paquete. El valor conservado es concreto: componentes compartidos, navegación, búsqueda, tipografía, controles de copia y fuentes de diseño. El trabajo original no cumplía por sí solo el nivel solicitado.

La comparación con Ticker y Drawer cubre la composición completa de Home, el preview integrado, la galería con fuente ejecutable, la documentación y las transiciones entre ellas. Los 46 estilos protegidos conservan sus fingerprints; las verificaciones visuales comprueban además lectura y resultados con contenido abierto. Se revisaron títulos, subtítulos, instrucciones, acciones, estados, límites y afirmaciones sobre publicación. Las capturas de esta pasada incluyen las dos acciones en móvil, el CSV mostrado y la guía de ejemplos. Una cifra de tests o un fingerprint no reemplazan la evaluación visual del mantenedor.

## Matriz de potencial y tareas

| Capacidad | Tarea y destino | Resultado que debe observarse | Evidencia |
| --- | --- | --- | --- |
| Estado asíncrono y actualización por id | `save`, `upload` | El nombre guardado queda en la página; un upload pasa por progreso y estado final sin duplicar su identidad. | Flujos repetidos, reset y fuentes copiadas. |
| Recuperación desde un error | `retry` | El primer envío falla; Retry cambia el estado real de la entrega local. | Acción de recuperación y resultado persistente. |
| Restauración de estado | `undo` | Se oculta el checklist y Undo restaura el mismo elemento. | Estado DOM antes/después y repetición. |
| Decisión encadenada | `decisions` | Review conserva la notificación; Join y Not now tienen resultados diferentes. Los permisos se leen antes de decidir. | Ramas completas en vivo y en copias; lectura con dos acciones. |
| Promesas con resultado útil | `task` | El CSV devuelto por unwrap se muestra desde View CSV. Error y cancelación liberan el formulario y no muestran éxito tardío. | Éxito/error/cancelación en las variantes copiadas y el preview. |
| Duración persistente | `persistent` | La invitación sigue disponible hasta un descarte explícito; sus detalles siguen en la página. | Cierre y reset. |
| DOM propio y contenido editable | `custom` | La nota se escribe dentro de la notificación y se guarda en la página. Conserva el borrador al cambiar de posición. | Teclas de edición, listener por render, cierre/reapertura y prueba de draft. |
| Apariencia propia | `custom` y referencia CSS | La tarjeta usa layout, textarea, tipografía y acciones del consumidor, sobre el ciclo de vida de Notify. | Estilos compartidos entre preview y fuentes copiadas; anchos estrechos. |
| Variantes normales y semánticas | `stream` | Eventos distintos generan estados normal/success/info/warning/error; el feed conserva su contexto. | Secuencia real, no cinco botones que solo cambian color. |
| Stack, expansión y límite visible | `stream` | Cambiar límite y expansión modifica el controlador existente. | Atributos y lectura por teclado; auto-close separado de cierre manual. |
| Gestos, foco y pausas | `stream`, `position` | Alt+T lleva al frente, foco expande, Delete descarta, esquina admite swipe y centro no. | Regresiones del paquete y Chromium sobre el artefacto construido. |
| Tema, idioma visual y dirección | `position` | Light/dark/system/page y LTR/RTL se aplican sin remontar. El tema explícito no se sobrescribe al cambiar el de la página. | Controles reales y prueba de actualización. |
| Fábricas de texto e historial | `history` | El mensaje se calcula al emitir; active cambia al descartar y history conserva el último registro por id. | Snapshots defensivos y eventos. |
| Montaje, limpieza y hosts | guías de lifecycle/frameworks | Un owner de aplicación monta y libera el singleton. React/Vue/Svelte/Astro y scopes CMS tienen cleanup explícito. | Compilación de fixtures y ejecución CMS multi-scope. |
| Extensión avanzada de estado | API/reference y recetas tipadas | Suscripciones se desregistran; direct mounts comparten estado por defecto y no inventan canales aislados. | Contrato y recetas preservadas; no se atribuye este API modular al registry CDN. |

La galería tiene once tareas, pero ese total no es el criterio de cobertura. Cada fila explica qué se construye y cómo se comprueba. Los archivos ESM/CDN separados y completos se ejecutan tal como aparecen en el visor. El generador elimina helpers y mensajes ajenos al escenario: las copias son legibles y no incluyen todo el catálogo de ejemplos.

## Fallos adicionales reproducidos y corregidos

- El style map no podía cambiar `--width`: el renderer lo sobrescribía. Ahora el ancho del consumidor se aplica; gap y medidas de stack siguen bajo las opciones para mantener coherencia entre CSS y JavaScript.
- Cambiar posición movía el DOM pero no renovaba la política de swipe de las notificaciones existentes. El snapshot incorpora la posición resuelta y actualiza esas interacciones.
- Backspace/Delete en campos custom podían descartar la notificación. Los controles editables conservan sus teclas; pointer starts en botones, links y campos no inician swipe.
- El gesto cancelado dejaba desplazamiento y podía bloquear el estado de interacción del stack. Se limpian transformaciones y tracking al cancelar.
- El criterio de velocidad podía descartar en la dirección opuesta. Ahora se requiere una dirección permitida.
- Actualizar duration con la pestaña oculta retenía el plazo anterior. Se reemplaza el plazo pausado cuando corresponde, conservándolo en cambios de contenido.
- La navegación por teclado no expandía el stack para leerlo. Ahora foco dentro lo expande; al salir se restablece la presentación.
- Dos acciones comprimían el texto a unos 60 px en 320 px aunque no hubiera overflow. Una comprobación de lectura lo reprodujo. El renderer agrupa ambas acciones en una fila inferior y permite el ajuste de etiquetas largas.
- El formulario custom de ejemplo retenía listeners de renders anteriores. Cada render tiene su AbortController y se dispone al reemplazar, descartar o desmontar.
- La documentación aún decía que el preview usaba el paquete publicado y sugería overrides de geometría que no funcionaban. Se corrigieron versión, cascada, width y ownership de la geometría. Se revisaron los textos de Home y se distinguió el título educativo del contexto de la tarea dentro del preview.

- Al abrir y expandir las cinco variantes semánticas, el tema claro incumplía contraste en success/info/warning/error. Se ajustaron sus colores de texto y la prueba evalúa los toasts abiertos en ambos temas, no solo páginas vacías.
- Una receta de suscripción no discriminaba correctamente ToastToDismiss. Se corrigió el narrowing; 19 recetas y dos snippets del README en TypeScript se comprueban contra los tipos reales, permitiendo solo los identificadores externos de la aplicación.
- Docs en desarrollo pedía el favicon bajo la base de Landing y devolvía 404. Cada aplicación usa su base de assets en desarrollo; las dos páginas y sus favicons responden 200.

- El README conservaba un índice incompleto y afirmaciones inexactas sobre factories custom, estilos inline y llamadas del controlador. Se alineó su progresión con Ticker y Drawer, se conservaron los anchors anteriores y se separó el inicio mínimo del ejemplo asíncrono, ahora con su función definida.

- Cambiar el tema de la página reenviaba duration desde el preview y reiniciaba el plazo de los toasts. Se reproduce con tiempo real; el cambio de tema ahora actualiza preferencias sin reenviar duración.

## Límites que se mantienen explícitos

3.2.1 es un patch preparado localmente, sin publicación ni tag. La vista en vivo usa ese runtime. Las copias CDN siguen en la versión publicada 3.2.0: su registry se resuelve explícitamente y el formulario contiene sus eventos de edición para compatibilidad. Ese CDN no adquiere los fixes de runtime de 3.2.1 por actualizar la documentación. No se presenta como evidencia de publicación ni como paridad visual de los fixes nuevos.

Las pruebas de navegador de esta pasada se ejecutan en Chromium 151; no se presentan como una corrida de Safari o Firefox ni como certificación completa de accesibilidad.

Las tareas de la galería son locales y simuladas. Un AbortController del consumidor cancela el trabajo; Notify no cancela requests. Un toast no sustituye una pantalla persistente o un diálogo para decisiones obligatorias. Los fixtures CMS no certifican un sitio real de Shopify/WordPress. La historia conserva registros desde el último reset; no es un log persistente de eventos ni aislamiento por componente.

## Validación de cierre

- Paquete: 178 pruebas en 10 archivos aprobadas; cobertura de líneas 93.89%, ramas 79.76%, funciones 95.91% y statements 91.29%. Typecheck, formato, build, smoke ESM/CommonJS/SSR y Chromium sobre el bundle construido aprobados.
- Chromium del paquete comprueba el script clásico antes/después del body, remount, width, edición nativa, swipe tras reposicionar y ancho de lectura con dos acciones.
- Sitio: `npm --prefix site run verify` termina con 69 pruebas de navegador aprobadas; además pasan los ocho tests Node, las dos adaptaciones de base, ambos checks Astro sin diagnósticos, los 46 estilos protegidos, 2175 enlaces en 40 páginas y la migración de 35 artículos/323 secciones.
- Las pruebas incluyen las 44 combinaciones de fuentes copiadas (once tareas × dos modos × separado/completo), decisiones con ambas salidas, éxito/error/cancelación del CSV, borrador custom al reconfigurar, teclado, edición, stack y layouts de 320 px con texto ampliado al 200%. Axe evalúa los flujos abiertos y las cinco variantes expandidas en light/dark.
- Comprobación adicional final: 19 recetas y dos snippets TypeScript del README contra los tipos reales. React se typecheckea; Vue/Svelte/Astro y snippets de sus guías compilan. Los fixtures CMS prueban scopes, reinserción y unload en Chromium.
- El validador oficial de skills aprueba `skills/notify`. Las auditorías de dependencias del paquete y sitio reportan cero vulnerabilidades conocidas. El registro npm sigue en 3.2.0 al comprobarlo el 4 de noviembre local.
- `npm pack --dry-run`: 23 archivos; 235.3 kB comprimidos y 920.1 kB sin comprimir. No incluye el workspace del sitio, pruebas ni instrucciones internas. No se ejecutó publicación, tag o push.
- Navegación en desarrollo: Home → Docs (4331) → Home → Examples comprobada en navegador; páginas y favicons de ambos orígenes devuelven 200. El preview combinado queda en 4330.

La comprobación inicial de contraste reprodujo fallos del paquete. Durante el cierre, la prueba de accesibilidad también requirió aislar cada flujo: navegar solo el hash conservaba la tarjeta custom y su botón deshabilitado. La prueba ahora recarga entre flujos; la continuidad entre previews se comprueba por separado. El resultado final completo es 69/69, no se trata ese timeout de aislamiento como otro defecto del runtime.

### Medición final — 2026-11-04 (hora de México)

Lighthouse 13.6.0, Chromium 151, Node 26.13.0 y Bun 1.4.4. Artefactos de producción servidos mediante fixtures HTTP locales con gzip idénticos. El baseline se reconstruyó desde `5150f4e`, después de empezar la reparación, usando el mismo toolchain del sitio; el resultado final corresponde al working tree sin commit sobre ese HEAD. No es una medición de una publicación remota ni una optimización aislada: cambian contenido y capacidades.

Móvil: 412 × 823, escala 1.75, simulación de 4× CPU, RTT 150 ms y 1638.4 Kbps. Cada resultado móvil es la mediana de tres navegadores nuevos con caché fría, sin builds o tests concurrentes. Desktop usa el config desktop de Lighthouse, verificado en los JSON; se tomó una muestra fría por ruta, no una mediana. Las muestras finales se repitieron después del último arreglo del tema. Las cifras del 31 de octubre no se usan como resultados actuales.

| Ruta | Performance antes → final | FCP/LCP antes → final | TBT antes → final | CLS antes → final | Speed Index antes → final | Requests | Transfer antes → final |
| --- | --- | --- | --- | --- | --- | --- | --- |
| home | 100 → 100 | 0.905 → 0.907 s | 0 → 0 ms | 0.000023 → 0.000023 | 0.952 → 1.014 s | 15 → 15 | 157.2 → 159.1 KiB |
| examples | 100 → 97 | 0.905 → 2.105 s | 0 → 5.5 ms | 0.000023 → 0.000023 | 0.905 → 2.105 s | 15 → 15 | 154.3 → 406.8 KiB |
| docs | 100 → 100 | 0.830 → 1.021 s | 0 → 0 ms | 0.007072 → 0.000780 | 0.830 → 1.021 s | 16 → 16 | 147.7 → 165.3 KiB |

Accesibilidad, buenas prácticas y SEO: 100 en todas las muestras móviles finales y en los tres checks desktop. Desktop performance: 100 en Home, Examples y Docs. El CLS desktop observado en Docs es 0.028842; no se declara cero. No hubo errores internos en las auditorías finales. Esto no certifica toda la accesibilidad ni aporta Core Web Vitals de usuarios reales.

| Ruta | Gzip HTML antes → final | Gzip JS externo antes → final | Gzip CSS externo antes → final | WOFF2 |
| --- | --- | --- | --- | --- |
| home | 21.3 → 19.4 KiB | 26.8 → 30.1 KiB | 10.0 → 10.5 KiB | 96.4 KiB |
| examples | 18.3 → 267.1 KiB | 26.8 → 30.1 KiB | 10.0 → 10.5 KiB | 96.4 KiB |
| docs | 27.9 → 45.6 KiB | 20.1 → 20.1 KiB | 0.0 → 0.0 KiB | 96.4 KiB |

La galería pasa del único ejemplo original a once tareas, con fuentes ESM/CDN separadas y completas, estáticas y resaltadas. La expansión explica la regresión de transferencia y FCP/LCP; el resultado sigue sobre la meta móvil de 95. Se eliminaron helpers, mensajes y selectores ajenos a cada copia sin quitar tareas ni contenido accesible sin JavaScript. Docs incluye su CSS en el HTML; no se cuenta dos veces.

Se tomaron además tres navegaciones repetidas finales, una por ruta, conservando el almacenamiento del navegador: Home 100/14 requests/158.8 KiB, Examples 97/14 requests/406.5 KiB y Docs 100/15 requests/164.9 KiB. El fixture no configura TTL de caché; estas observaciones no demuestran una mejora de caché del hosting. No se cambió la política de caché ni el umbral de inlining. La compresión, HTTPS y headers del despliegue real siguen sin verificarse porque no se publicó.

Los 24 reportes finales (18 muestras móviles frías, tres repetidas y tres desktop), medians.json, sizes.json, condiciones y fixture se conservan fuera de Git en la evidencia `notify-audit/second-pass/performance`. Los archivos intermedios están separados y excluidos de las medianas finales.
