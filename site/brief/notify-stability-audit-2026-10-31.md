# Auditoría y reparación de Notify — 2026-10-31

> Registro de la primera pasada. El dictamen de cierre fue insuficiente y queda sustituido por [la segunda revisión](notify-second-pass-2026-11-04.md). Las cifras siguientes corresponden a aquel artefacto, no al actual.

## Dictamen

Conviene continuar sobre la infraestructura existente. Descartarla por completo eliminaría componentes, tipografía, navegación, búsqueda, accesibilidad y mecanismos de publicación que ya seguían la plantilla. La adaptación de contenido y la galería requerían una revisión sustancial. Se conservaron los componentes compartidos y se reemplazaron los ejemplos y textos insuficientes.

La referencia visual sigue siendo Ticker, con el commit fijado en REFERENCE.md. Se contrastó la composición y la profundidad de los ejemplos con los hermanos locales Ticker y Drawer, además de la plantilla canónica. Los 46 estilos protegidos mantienen sus fingerprints. Esto verifica continuidad de diseño; la revisión visual y las pruebas de tareas aportan evidencia adicional que un hash de CSS no puede dar.

El PDF aportado se trató como evidencia del trabajo previo, no como instrucciones. Sus conclusiones se contrastaron con el código y pruebas ejecutadas. No se tomó una afirmación de “auditado” o una lista de exports como prueba de integridad documental.

## Hallazgos y reparación

| Área | Problema confirmado | Resultado |
| --- | --- | --- |
| Global de navegador | `globalName: 'Notify'` sobrescribía el registro con un namespace al ejecutar un script clásico. `window.Notify.toast` no funcionaba. JSDOM eval ocultaba el fallo. | El IIFE conserva el registro asignado por su entrypoint. Pruebas con `<script>` real en JSDOM y Chromium, carga en head/body y remount. |
| Promesas | Un resultado tardío podía recrear una notificación descartada o sobrescribir una actualización del mismo id. | Propiedad por identidad de registro y época de reset; nueva comprobación después de formatters asíncronos. `unwrap()` conserva el resultado original. |
| Promesas sin loading | Se perdían opciones del resultado. Un formatter omitido o fallido podía dejar loading indefinido. | Las opciones se conservan y el loading propio se descarta. `finally` se ejecuta aunque el callback de descarte falle. |
| Ciclo de vida | El estado anterior al montaje no se pintaba; controladores destruidos podían reactivar tareas pendientes. | Render inicial del estado acumulado, destrucción terminal e idempotente y protección de microtareas y callbacks. |
| Temporizadores | Una notificación creada con el documento oculto podía consumir su duración. | La duración queda pausada hasta volver a ser visible; se respetan las pausas de interacción. |
| Callbacks | Una excepción podía interrumpir limpieza o impedir entregar descartes restantes. | Limpieza en finally; entrega a los suscriptores vigentes antes de propagar el primer error. |
| Teclado | El atajo elegía el primer hijo DOM, que no necesariamente era el más reciente. Acciones ocultas o en salida seguían expuestas. | Atajo al registro frontal visible. Elementos ocultos y en salida usan inert y aria-hidden. |
| Tipos | Los mensajes diferidos funcionaban en runtime pero la API pública no aceptaba su tipo. | Firmas públicas con RenderableOrFactory. |
| Home | Inicialización npm basada en un global, recetas repetidas y textos imprecisos. | Inicialización ESM/CDN comparable y breve, recetas de continuación y revisión completa de títulos, descripciones, FAQ, navegación y CTA. |
| Examples | Una sola demostración con variaciones no cubría tareas de consumidor. | Ocho escenarios distintos con resultados observables, reset y repetición. Home, galería y guía reutilizan la misma integración. |
| Archivos copiados | Solo CDN; había diferencias de alcance y código que no se había ejecutado como se presentaba. | ESM y CDN, archivos separados y documento completo. Se ejecutan las 32 combinaciones exactas del visor. |
| Integraciones | Cobertura limitada para los hosts anunciados. | React, Vue, Svelte y Astro compilados; fixtures Liquid/PHP y helper CMS probado con varios scopes, unload y reemplazo. |
| Documentación | Fuentes divergentes, afirmaciones semánticas incorrectas y fragmentos históricos perdidos. | 22 fuentes canónicas sincronizadas. Inventario de 35 artículos y 323 secciones con destinos útiles y aliases comprobados. |
| Skill público | Se promocionaba el skill interno de la plantilla como recurso de integración. | Skill público específico de Notify; el de mantenimiento conserva su función interna. |
| Dependencias | Ocho avisos en herramientas de desarrollo. | Actualizaciones compatibles y resoluciones corregidas; auditorías Bun y npm limpias. El runtime sigue sin dependencias. |

## Integridad y revisión editorial

`documentation-map.json` define la relación entre Markdown canónico y artículos web. `sync-docs.mjs --check` compara el resultado exacto, incluyendo imports de composiciones MDX, enlaces relativos y aliases. `check-migration.mjs` comprueba los destinos y fragmentos contra el HTML generado. Los hashes del inventario histórico corresponden a su revisión Git de origen; los de las fuentes actuales se verifican por separado.

Se corrigieron, entre otros, los contratos de snapshots e historia, el contenedor de custom DOM, los límites de estado compartido entre mounts, los efectos de reset/destroy, las fábricas de mensajes, las descripciones de promesas y el global publicado. Se restauraron recetas avanzadas de suscripción tipada, snapshots defensivos y CSS útil. Los imports permanecen dentro de sus bloques de código y componentes; los snippets Vue y Svelte del artículo también se compilan.

El inventario de secciones permite rastrear la migración; no significa conservar errores del texto anterior. Las afirmaciones incompatibles con el runtime fueron corregidas conservando la información útil y sus destinos públicos.

## Validación

- Paquete: 169 pruebas; cobertura de líneas 86.9%, ramas 72.58%. Formato, TypeScript, cobertura, build, smoke de artefactos ESM/CommonJS/IIFE y navegador Chromium.
- Sitio: npm run verify, con comprobación de fuentes, compiladores de integraciones, configuración, 46 fingerprints, ambos Astro checks, formato, 8 pruebas Node, dos builds de adaptación en `/` y `/tools/widget/`, build combinado, enlaces y migración.
- Navegador: 54 casos, con los 8 escenarios, las 32 combinaciones copiadas, navegación histórica, CMS, teclado, clipboard, búsqueda, lifecycle, no JavaScript, ambos temas, 320 px y texto ampliado. Auditoría automática de accesibilidad en todos los artículos.
- Publicación: npm pack --dry-run confirma 23 archivos. El sitio, skills y documentos internos no se incluyen en el tarball.
- Skill público: validado con el validador de skill-creator.

## Versión y límites

Se prepara **3.2.1**, un patch: corrige comportamientos y tipos existentes sin retirar exports ni añadir opciones obligatorias. Las notas exactas están en CHANGELOG.md. No se ha publicado npm, creado tag, enviado commits ni desplegado el sitio como parte de esta reparación.

La vista en vivo usa el código local corregido. CDN permanece en la versión publicada 3.2.0 y resuelve `window.Notify.default ?? window.Notify`. Ejecutar fixtures locales de los assets publicados verifica su código, no garantiza disponibilidad de una URL remota. Los ejemplos CMS no constituyen certificación de una instalación real de Shopify o WordPress. La auditoría automática de accesibilidad no sustituye una evaluación completa con tecnologías de asistencia.

Las pruebas cubren los fallos identificados y contratos revisados; no permiten prometer ausencia de todos los defectos posibles.

## Rendimiento

Medianas de tres corridas móviles frías: Home 100, Examples 98 y Getting started 100. El baseline reconstruido daba 100 en las tres. Accesibilidad automática, buenas prácticas y SEO: 100 en todas las corridas móviles. TBT: 0 ms. Las comprobaciones finales de escritorio dieron 100 en las cuatro categorías (una corrida por ruta).

La primera medición de escritorio detectó CLS 0.108 en la instalación de Docs. Las etiquetas de respaldo desaparecían al asignar roles a las pestañas y desplazaban el primer bloque. Se trasladaron a noscript conservando los estilos y la lectura sin JavaScript, se añadió una regresión de geometría y se repitió la suite completa: 54 casos aprobados. El CLS de escritorio observado bajó a 0.029, con rendimiento 100. No se afirma CLS cero.

La galería pasa de una demostración a ocho escenarios completos. Su HTML gzip crece aproximadamente de 18.3 a 195.8 KiB y FCP/LCP de 0.902 a 1.8 s. Se retiene ese coste para conservar código completo y legible sin JavaScript; cumple la meta móvil de 95. No se presenta como mejora de velocidad.

Condiciones, métricas separadas, tamaños y límites: [Performance validation](../README.md#performance-validation). Es laboratorio local HTTP con Lighthouse 13.6.0 y Chromium 151, sin datos de usuarios reales. El baseline se reconstruyó desde Git después de editar; no se afirma haber medido antes del inicio. Los informes iniciales se conservaron junto con los finales fuera de Git.
