# Notify: revisión de controles y estilos — 2026-11-05

## Alcance y corrección del cierre anterior

El cierre visual anterior fue insuficiente. Las pruebas de comportamiento y los fingerprints de componentes compartidos no comprobaron la calidad del CSS específico de los ejemplos. El usuario señaló la flecha del select y la ausencia de cursor pointer; ambos fallos estaban presentes.

Esta revisión comprende los controles y sus estados, el formulario custom, Home, Examples, Docs, y los archivos copiados de cada escenario. Las reparaciones de runtime y la conciliación documental anteriores se conservan; sus resultados fechados no se presentan como validación de este nuevo artefacto.

## Referencias comprobadas

- Ticker: commit visual fijado `8a30c9ca8486953fdc2801f0ceff8b17d0cb5615`, `landing/src/components/ExamplePreview.astro`: selects con superficie `--color-bg-soft`, borde semántico, radio `--radius-control`, foco de 2 px separado 3 px y tamaño mínimo de interacción.
- Drawer: commit `f45182f01d39a78aec3e084e33370f7f81795e85`, `shared/components/DemoStyles.astro`, sin cambios locales en ese archivo: inputs/selects con fuente heredada, colores semánticos, radio de control y checkbox de 1.125rem con accent-color. Se abrió también su formulario de filtros para observarlo.
- Plantilla de Notify: `shared/components/TextField.astro`, Button y los tokens de theme. TextField aporta el mínimo de 3.125rem, fuente de 1rem y superficie diferenciada de los botones.

La flecha nativa de las referencias tampoco garantiza un inset uniforme. No se copió ese defecto: la petición expresa del usuario autoriza una flecha decorativa con espacio reservado, manteniendo un select HTML real. No se añadió un listbox, otro controlador JavaScript o una dependencia. El artifact existente de Ticker se consultó de forma exploratoria; el contrato usado es el código del commit fijado, no ese build sin procedencia verificada.

## Hallazgos y cambios concretos

| Elemento | Defecto encontrado | Reparación |
| --- | --- | --- |
| Flecha de select | La flecha del navegador quedaba pegada al borde; el padding no reservaba su zona. | Wrapper decorativo, chevron centrado, inset lógico de hasta 1rem y padding final de hasta 2.75rem, limitados por el viewport al ampliar texto. El icono no recibe eventos. |
| Lectura ampliada | A 320 px y 200%, el padding escalado dejaba 64 px de texto dentro de un campo de 184 px. | Padding adaptativo conserva al menos el 60% del ancho para el valor, sin reducir la fuente ni superponer la flecha. |
| Select | Cursor default. | Pointer en estado disponible; not-allowed al deshabilitar. |
| Superficie de campos | Se usaba el token de fondo de botones. | Fondo `--color-bg-soft`, texto y borde semánticos de la plantilla. |
| Tipografía y tamaño | Selects y campos heredaban tamaños distintos del contenido. | Inter a través de `--font-sans`, 1rem, altura mínima de 3.125rem, mismos espacios y radio de control. |
| Texto editable | Cursor y dimensiones dependían de los defaults. | Cursor text, ancho contenido y tipografía explícita; textarea conserva resize vertical. |
| Foco y hover | Faltaba una respuesta de borde propia de campos. | Borde de hover de la paleta; foco con los tokens de ancho/offset de la plantilla. |
| Botones deshabilitados | Cursor wait aunque no hubiera trabajo; hover activo seguía cambiando el fondo. | Opacidad de estado, cursor not-allowed y hover neutralizado para botones no disponibles. |
| Reset | Reducía arbitrariamente la fuente del Button compartido. | Se elimina ese override; vuelve al tamaño y variante ghost del componente. |
| Checkbox | Tamaño y accent nativos sin tratar; cursor inconsistente. | 1.125rem, sin márgenes extra, accent de marca y pointer en label/input. |
| Tarjeta custom | `--font-body` no existe en la plantilla y caía a system-ui. | Usa `--font-sans`; acciones compactas con jerarquía primaria/secundaria coherente. |
| Tarjeta en viewport corto | Su contenido no tenía límite vertical propio ni usaba todo el ancho disponible del toast. | Ancho del contenedor y altura máxima dependiente del viewport, con scroll interno y controles accesibles por teclado. |
| Fuentes copiadas | Sus botones tenían otra geometría y faltaban estados; no contenían el tratamiento de flecha. | Mismo generador de markup y CSS que el preview, con estilos de acciones correspondientes a las variantes live y fallbacks neutros. Se siguen eliminando selectores ajenos al escenario. |
| Movimiento | Los nuevos estados no declaraban reducción de movimiento. | Las transiciones añadidas se desactivan con prefers-reduced-motion. |

Los 46 estilos protegidos de la plantilla permanecen intactos. Esto acota la modificación; no se usa como prueba suficiente de calidad visual.

## Verificación

- `npm --prefix site run verify`: 74 pruebas de navegador aprobadas sobre el arreglo final del ancho de lectura, además de ambos checks Astro, formato, ocho pruebas Node, las dos adaptaciones de base y el build combinado.
- Se verifican 2175 enlaces en 40 páginas, los 46 estilos protegidos y la migración de 35 artículos/323 secciones. Las 22 fuentes Markdown canónicas siguen sincronizadas y las 21 continuaciones TypeScript siguen compilando contra la API real.
- Las pruebas nuevas comprueban cursores, fuente, tamaño, foco, espacio de flecha y área útil de lectura en 1280/320 px, texto 100/200% y ambos temas. Se conserva al menos el 60% del ancho para el valor. La selección nativa por escritura y Tab mantiene el funcionamiento de teclado.
- A 320 × 720 y texto 200%, el editor custom permanece dentro del viewport, permite scroll interno, recibe foco por teclado y guarda la nota. El estado disabled no muestra hover activo ni cursor wait; checkbox y selects usan pointer.
- Los 44 archivos separados/completos en modos ESM/CDN vuelven a ejecutarse. Sus selects se comprueban también por cursor e inset; no basta con que el CSS corregido aparezca en el preview.
- Revisión manual: Home en claro/oscuro, Docs y su búsqueda abierta con resultados, galería y selects a 320 px en ambos temas, picker nativo abierto/cerrado y edición/guardado de la tarjeta custom. Capturas y registros en la evidencia local `controls-review`. Se consultaron las fuentes fijadas y el formulario de Drawer descritos arriba.

La revisión automatizada se ejecuta en Chromium 151; no se presenta como certificación completa de accesibilidad ni como una corrida en Safari/Firefox. Las pruebas iniciales del teclado con secuencias de apertura del popup no eran portables al entorno headless de macOS; la regresión final usa selección por escritura con foco real y Tab. La comprobación del ancho útil sí reprodujo un defecto real de padding (64 px de lectura a 200%) antes de la corrección.

El preview combinado permanece en `http://127.0.0.1:4330/notify/`. Las capturas y cifras anteriores a esta revisión conservan su fecha.


## Rendimiento del artefacto actual

Medido el 5 de noviembre (hora de México), con Lighthouse 13.6.0, Chromium 151, Node 26.13.0 y Bun 1.4.4. Ambos artefactos se sirven con el mismo fixture local HTTP/gzip. El baseline se reconstruyó de `5150f4e` usando el mismo toolchain, después de empezar la reparación; no es una medición histórica previa al trabajo. El actual es el working tree sin commit. El contraste incluye pasar de un único ejemplo a once tareas y toda su fuente, además del arreglo visual; no aísla una optimización.

Móvil: tres muestras frías por ruta/artefacto, cada una con navegador nuevo, 412 × 823, escala 1.75, CPU simulada 4×, RTT 150 ms y 1638.4 Kbps. Se presentan medianas; sin builds ni tests concurrentes. Las nueve muestras base se tomaron de nuevo esta fecha y las nueve actuales se repitieron tras el último arreglo del padding. Desktop usa explícitamente el config desktop de Lighthouse y una muestra fría por ruta. Hay además una navegación repetida por ruta conservando almacenamiento. Los JSON registran las condiciones reales.

| Ruta | Performance base → actual | FCP/LCP base → actual | TBT | CLS base → actual | Speed Index base → actual | Requests | Transfer base → actual |
| --- | --- | --- | --- | --- | --- | --- | --- |
| home | 100 → 100 | 0.905 → 0.907 s | 0 → 0 ms | 0.000023 → 0.000023 | 0.926 → 0.917 s | 15 → 15 | 157.2 → 159.7 KiB |
| examples | 100 → 95 | 0.905 → 2.405 s | 0 → 8.5 ms | 0.000023 → 0.000023 | 0.905 → 2.405 s | 15 → 15 | 154.3 → 452.8 KiB |
| docs | 100 → 100 | 0.829 → 1.032 s | 0 → 0 ms | 0.007072 → 0.000780 | 0.829 → 1.032 s | 16 → 16 | 147.7 → 169.4 KiB |

Desktop: performance 100 en las tres rutas. Accesibilidad, buenas prácticas y SEO: 100 en todas las muestras finales móviles y desktop. No hubo errores internos. El CLS desktop de Docs es 0.028842, no cero.

| Ruta | Gzip HTML actual | Gzip JS externo | Gzip CSS externo | WOFF2 |
| --- | --- | --- | --- | --- |
| home | 19.4 KiB | 30.1 KiB | 11.0 KiB | 96.4 KiB |
| examples | 312.5 KiB | 30.1 KiB | 11.0 KiB | 96.4 KiB |
| docs | 49.7 KiB | 20.1 KiB | 0.0 KiB | 96.4 KiB |

La galería tiene más transferencia y FCP/LCP que el baseline de un solo ejemplo. Sus fuentes completas, estáticas y resaltadas explican la mayor parte del coste; los controles corregidos también amplían ese CSS mostrado. El 95 móvil actual no se presenta como 97 ni como una aceleración. Cumple la meta mínima de 95, con texto y código legibles y sin ocultar fuentes para subir la puntuación. La flecha CSS no añade peticiones. Docs incluye su CSS en HTML, sin contarlo dos veces.

No se cambiaron caché ni umbral de inlining. Las navegaciones repetidas no certifican headers de hosting: el fixture no fija TTL. Los resultados son locales; no se publicó ni se verificaron métricas de campo, HTTPS o compresión remota. Los 24 reportes finales, medianas, tamaños, condiciones y fixture quedan fuera de Git en `controls-review/performance`; las muestras previas al último arreglo están separadas.
