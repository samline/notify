# Blueprint Interno Para Replicar Este Paquete En Otro Dominio

## Instrucción Para La IA

Este archivo está escrito para que la IA que trabaje dentro de este repositorio lo revise antes de proponer o construir un paquete nuevo basado en esta misma arquitectura.

Si en una conversación futura se pide crear otro paquete siguiendo este modelo, la IA debe revisar primero este documento, identificar qué partes del scaffold actual sí aplican al nuevo dominio y pedir la información faltante antes de generar código.

> **NOTA CRÍTICA DE REPLICACIÓN — 2026-07-13:** Este paquete `@samline/notify` fue reescrito desde cero siguiendo el modelo de `@samline/forms`. Es **puramente vanilla/browser** — no exporta React, Vue, Svelte ni ningún otro framework. **NO** se debe re-introducir:
>
> 1. Wrappers por framework (`@samline/notify-react`, `notifyPlugin` para Vue, `toaster` action para Svelte, etc.). Si el usuario los pide en el futuro, deben vivir en paquetes separados.
> 2. Peer dependencies de React/Vue/Svelte.
> 3. Cualquier `jsx-runtime`, `import 'react'`, `import 'vue'`, `import 'svelte'`, o uso de `ReactNode`/`VNode`/`SvelteComponent`.
> 4. Auto-publish a npm — el modelo es **publish manual** desde la terminal del usuario. **NO** crear `.github/workflows/publish*.yml` ni equivalente (ver `.agents/deploy-and-release-guide.md`).
> 5. JSX en el código fuente. Los iconos son strings SVG; el renderer manipula el DOM directamente.
>
> Si en una sesión futura la IA se siente tentada a "agregar React para hacer la API más fácil", esa es la regresión que este paquete rechaza por contrato (ver scratchpad `mvs_aac2f5124d2148a1acbf169898a99fbd`).

## Objetivo

Este documento resume la arquitectura completa de este paquete y la traduce a un blueprint reutilizable para construir un paquete independiente con la misma calidad de implementación, por ejemplo un paquete para parsear, convertir y formatear fechas.

La meta no es clonar el dominio de visibilidad, sino reutilizar su estructura de producto:

- core compartido
- un solo entrypoint (vanilla) — sin variantes por framework
- build multi-entrypoint (esm+cjs+dts + iife+dts)
- documentación separada por capa
- pruebas por capa
- publicación npm con controles previos (manual)

## Qué Debo Pedirte Antes De Crear El Nuevo Paquete

Antes de empezar la implementación, necesito estos datos:

1. Nombre del paquete npm.
2. Descripción corta del paquete.
3. Objetivo funcional exacto.
4. Código fuente inicial del paquete o una especificación funcional suficientemente precisa.
5. API pública deseada.
6. Dependencias runtime obligatorias.
7. Peer dependencies opcionales, si aplica — y solo si el dominio lo justifica.
8. Frameworks que deben estar soportados desde la primera versión.
9. Si debe existir una variante browser o CDN sin build step.
10. Versión mínima de Node.js.
11. Licencia.
12. URL de repositorio, homepage e issues, si ya existen.
13. Ejemplos reales de uso esperados.
14. Restricciones de compatibilidad o rendimiento.
15. Estrategia de publicación: público o privado, alcance npm, prerelease o release estable.
16. Preferencias de testing, lint, formateo y cobertura.

Sin esos datos, el scaffold puede quedar técnicamente correcto pero mal alineado con el producto real.

### Regla por defecto de compatibilidad Node

Si el usuario no define otra restricción, los paquetes replicados desde este blueprint deben mantenerse compatibles con Node 20 o superior, incluyendo Node 24 y versiones posteriores que sigan siendo razonables para el stack elegido.

La IA no debe subir el requisito mínimo de Node por encima de 20 ni usar APIs que fuercen esa subida sin una solicitud explícita.

## Regla De Uso Para La IA

Antes de iniciar un scaffold nuevo dentro de este repositorio o en uno similar, la IA debe:

1. Revisar este archivo completo.
2. Confirmar si el nuevo dominio realmente necesita wrappers React, Vue, Svelte o un bundle browser separado.
3. Pedir el código fuente o la especificación funcional si todavía no existe suficiente detalle.
4. No asumir que todos los entrypoints del paquete actual deben replicarse — `@samline/notify` es **solo vanilla + browser**, sin `/react`, `/vue`, `/svelte`.
5. Mantener el resultado alineado con el alcance real y no con una plantilla inflada.

## Resumen Del Paquete Actual

Este proyecto sigue una arquitectura vanilla-only con TypeScript y ESM:

- un core compartido en `src/core/`
- una API pública expuesta desde el root (`src/index.ts`)
- un bundle IIFE para uso sin bundler (`src/browser/global.ts`)
- un singleton browser-side (`src/browser/registry.ts`)
- documentación en `docs/` y un sitio Starlight en `example/`
- pruebas separadas por capa en `test/`
- **cero wrappers por framework**

### Capacidades del scaffold actual

1. Publica el root (`@samline/notify`) y un subpath `browser` (`@samline/notify/browser`).
2. Publica solo `dist/`.
3. Genera tipos TypeScript para cada subpath.
4. **No** tiene peer dependencies de frameworks.
5. Ejecuta `clean`, `build`, `typecheck` y `test` antes de publicar.
6. CSS vive en `src/styles.css` (copiado 1:1 al build) y se sirve vía el subpath `@samline/notify/styles.css`.

## Archivos Que Sirven Como Plantilla

### Metadatos y build

- `package.json`: nombre del paquete, exports (`"."`, `"./browser"`, `"./styles.css"`), sin peer dependencies, scripts, `files` limitado a `dist`.
- `tsup.config.ts`: dos entries — `index` (esm+cjs+dts, `clean: true`) y `browser/global` (iife+dts, `clean: false`, `globalName: 'Notify'`). `external: []` en ambos.
- `tsconfig.json`: strict, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`, `moduleResolution: 'Bundler'`, lib ES2020 + DOM.
- `vitest.config.ts`: jsdom, `environmentOptions.jsdom.url: 'http://localhost/'`, include `test/**/*.test.ts`.
- `.gitignore`: `node_modules/`, `dist/`, `coverage/`, `bun.lockb` (legacy), lockfiles viejos. **NO** ignorar `AGENTS.md` ni `.agents/`.
- `.npmignore`: excluye `src/`, `test/`, `docs/`, `example/`, configs de build, lockfiles, `AGENTS.md`, `.agents/`.

### Código fuente

- `src/core/types.ts`: tipos públicos (`ToastId`, `ToastType`, `Renderable`, `ToastOptions`, `Position`, `Theme`, `Direction`, `Offset`, `ToasterOptions`, `ToasterController`).
- `src/core/constants.ts`: defaults numéricos (`VISIBLE_TOASTS_AMOUNT`, `TOAST_LIFETIME`, `SWIPE_THRESHOLD`, etc.).
- `src/core/dom-helpers.ts`: `createEl`, `setAttrs`, `addListener`, `cn`, `canUseDOM`, `getDocumentDirection`, `assignOffset`.
- `src/core/icons.ts`: funciones que devuelven **strings SVG** para cada tipo y `getLoaderMarkup()` con 12 `.notify-loading-bar` divs.
- `src/core/state.ts`: singleton `Observer` con `create`, `dismiss`, `success`, `error`, `info`, `warning`, `loading`, `message`, `promise`, `custom`, `getActiveToasts`, `getHistory`, `getToasts`, `resetToastState`. **Sin React.**
- `src/core/renderer.ts`: `mountToaster(root, options, state)` que arma el `<ol data-notify-toaster>`, aplica CSS variables, suscribe al Observer y maneja timers, swipe-to-dismiss, close button, action/cancel buttons y expansion. **Sin JSX.**
- `src/api/toast.ts`: factory `toast()` + variants (`success`, `error`, `info`, `warning`, `loading`, `message`, `promise`, `dismiss`, `getHistory`, `getToasts`).
- `src/api/create-toaster.ts`, `src/api/destroy-toaster.ts`, `src/api/get-toaster.ts`, `src/api/configure-toaster.ts`, `src/api/reset-toasts.ts`: un archivo por método público.
- `src/browser/registry.ts`: singleton browser-side con la misma shape que el IIFE.
- `src/browser/global.ts`: IIFE entry, asigna `globalThis.Notify` y auto-monta un toaster.
- `src/index.ts`: barrel del root, reexporta API + tipos.
- `src/styles.css`: port 1:1 del CSS original, sin cambios.

### Documentación

- `README.md`: puerta de entrada — sigue forma de `@samline/forms/README.md`.
- `docs/`: documentación de la API vanilla en Markdown plano.
- `example/`: sitio Starlight (opcional, ver `.agents/todo.md` si queda pendiente).

### Testing

- `test/core/state.test.ts`: contrato del Observer.
- `test/core/renderer.test.ts`: data-attributes, CSS variables, mount/unmount.
- `test/core/dom-helpers.test.ts`: helpers puros.
- `test/api/*.test.ts`: un archivo por método público.
- `test/browser/global.test.ts`: IIFE expone `globalThis.Notify`.

## Arquitectura Reutilizable

La parte reusable no es IntersectionObserver en sí, sino la separación de responsabilidades.

### Capa 1: Core compartido

El core debe contener la lógica del dominio sin dependencias de framework.

Ejemplos:

- notify: Observer singleton + renderer vanilla
- fechas: parseDate, formatDate, convertTimezone, compareDates
- moneda: parseMoney, formatMoney, normalizeCurrency

Reglas:

1. No depender de React, Vue ni Svelte.
2. Exponer tipos reutilizables.
3. Resolver el comportamiento principal del dominio.
4. Ser la base de todas las variantes posteriores.

### Capa 2: API vanilla o shared

Esta capa expone el core con la interfaz más simple posible.

Debe existir incluso si luego se agregan wrappers por framework, porque:

- define el contrato base
- simplifica pruebas unitarias
- facilita el uso en scripts y librerías
- evita duplicar lógica en wrappers

### Capa 3: Variantes por framework

> **NO APLICABLE A ESTE PAQUETE.** `@samline/notify` no exporta variantes por framework. Si el usuario quiere React/Vue/Svelte en el futuro, deben vivir en paquetes separados (`@samline/notify-react`, etc.) con sus propios scaffolds. Mezclar frameworks en este paquete viola el contrato y los `grep -rE 'react|vue|svelte' dist/` van a fallar en el gate final.

Solo deben existir si el framework gana una API idiomática real.

No hay que forzar wrappers si el dominio no lo necesita.

### Capa 4: Variante browser o CDN

Esta capa tiene sentido en este paquete porque el caso real sin bundler existe (Shopify, WordPress, plantillas HTML).

## Árbol Actual Del Paquete

```text
notify/
├── AGENTS.md
├── .agents/
│   ├── agent-index.md
│   ├── new-project.md
│   ├── todo.md
│   ├── lessons.md
│   └── deploy-and-release-guide.md
├── README.md
├── LICENSE.md
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── vitest.config.ts
├── .prettierrc.js
├── .gitignore
├── .npmignore
├── docs/
│   ├── README.md
│   ├── getting-started.md
│   ├── options.md
│   ├── css-styling.md
│   ├── typescript.md
│   ├── browser.md
│   ├── api/
│   │   ├── index.md
│   │   ├── toast.md
│   │   ├── create-toaster.md
│   │   ├── destroy-toaster.md
│   │   └── get-toaster.md
│   └── recipes.md
├── example/  (Starlight, opcional)
├── src/
│   ├── index.ts
│   ├── core/
│   │   ├── types.ts
│   │   ├── constants.ts
│   │   ├── dom-helpers.ts
│   │   ├── icons.ts
│   │   ├── state.ts
│   │   ├── renderer.ts
│   │   └── index.ts
│   ├── api/
│   │   ├── toast.ts
│   │   ├── create-toaster.ts
│   │   ├── destroy-toaster.ts
│   │   ├── get-toaster.ts
│   │   ├── configure-toaster.ts
│   │   └── reset-toasts.ts
│   ├── browser/
│   │   ├── global.ts
│   │   └── registry.ts
│   └── styles.css
├── test/
│   ├── core/
│   │   ├── state.test.ts
│   │   ├── renderer.test.ts
│   │   └── dom-helpers.test.ts
│   ├── api/
│   │   ├── toast.test.ts
│   │   ├── create-toaster.test.ts
│   │   ├── destroy-toaster.test.ts
│   │   └── get-toaster.test.ts
│   └── browser/
│       └── global.test.ts
└── dist/  (generado por tsup)
```

## Entry Points Que Debes Decidir

Este paquete actual publica:

- paquete raíz (`@samline/notify`)
- `"./browser"` (IIFE para `<script>` directo)
- `"./styles.css"` (CSS empaquetado)

**No** publica `/react`, `/vue`, `/svelte`, ni subpaths de framework.

### Regla de decisión para nuevos paquetes

1. Mantén el entrypoint raíz.
2. Añade un subpath `browser` solo si existe el caso real sin bundler.
3. Añade `/react`, `/vue`, `/svelte` solo si habrá integración idiomática real.
4. No infles el `package.json` con subpaths que no tienen código.

## Build Y Publicación

### Patrón actual que conviene replicar

1. TypeScript estricto.
2. Build con tsup.
3. Salida ESM + CJS + dts para el root; IIFE + dts para browser.
4. Tipos generados para cada export.
5. `prepublishOnly` con `clean → build → typecheck → test`.
6. `files` en `package.json` limitado a `dist`.
7. **No** hay workflow de GitHub Actions para publicar — el usuario hace publish local. (Ver `.agents/deploy-and-release-guide.md`.)
8. Compatibilidad de engines y decisiones de implementación que no rompan soporte para Node 20 o superior salvo instrucción explícita.

### Scripts mínimos recomendados

```json
{
  "clean": "rm -rf dist coverage",
  "build": "tsup --config tsup.config.ts",
  "dev": "tsup --config tsup.config.ts --watch",
  "format": "prettier --write .",
  "format:check": "prettier --check .",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "test:watch": "vitest",
  "prepublishOnly": "bun run clean && bun run build && bun run typecheck && bun test"
}
```

> **Toolchain (decisión 2026-07-13):** el package manager canónico de este repo y de todos los de `Packages/` es **bun**. El lockfile es `bun.lock` (texto), no `bun.lockb` ni `package-lock.json`. Ver `.agents/lessons.md` para la regla completa. `bun run` y `npm run` son intercambiables dentro de `package.json` (bun implementa el subcomando `run` de npm), pero `bun run` deja explícita la intención.

### Decisiones que debes fijar al crear el nuevo paquete

1. Nombre de los subpaths exportados.
2. Si habrá peer dependencies opcionales (en este paquete: **no**).
3. Si habrá bundle IIFE global para browser (en este paquete: **sí**).
4. Si el target seguirá siendo `es2020` o cambiará.
5. Si la variante root será equivalente a vanilla o a otro agregado.

## Patrón De Documentación A Replicar

### README principal

Debe contener:

1. Descripción corta del paquete.
2. Tabla de contenidos obligatoria para navegar las secciones principales.
3. Instalación mínima con npm, pnpm, yarn y bun.
4. Casos de uso reales.
5. Tabla de entrypoints.
6. Quick start del entrypoint principal.
7. Índice hacia la documentación específica.
8. Resumen de la API compartida.
9. Notas de compatibilidad.
10. Licencia.

### Reglas mínimas del README

- Misma estructura que `@samline/forms/README.md`.
- Debe documentar el bundle browser con una URL de CDN o equivalente.
- Las URLs de CDN versionadas deben coincidir con `package.json` antes de cada release (lección heredada de `@samline/forms`).

## Patrón De Testing A Replicar

### Nivel mínimo obligatorio

1. Tests del core compartido.
2. Tests de la API vanilla.
3. Tests del bundle browser.
4. Helper compartido para mocks del entorno (jsdom por defecto).

### Qué debe validar cada capa

#### Core state

- `create` agrega un toast y devuelve id autoincremental.
- `create` con `id` explícito no duplica: actualiza el existente.
- `dismiss(id)` lo marca dismissed, `getActiveToasts()` lo excluye.
- `dismiss()` sin args dismissa todos.
- `success/info/warning/error/loading/message` setean el type correcto.
- `promise` con resolve: emite loading + success.
- `promise` con reject: emite loading + error.
- `resetToastState()` limpia el estado y reinicia el counter.

#### Core renderer

- `mountToaster` crea un `<ol data-notify-toaster>` con los data-attributes correctos.
- Las CSS variables `--offset-*` y `--mobile-offset-*` se aplican correctamente.
- Tras `toast('hello')`, aparece un `<li data-notify-toast data-type="normal">`.
- `toast.success()` aplica `data-type="success"`.
- `richColors: true` aplica `data-rich-colors="true"`.
- `toaster.destroy()` remueve el contenedor del DOM.

#### API

- `toast('msg', opts)` retorna un `ToastId` y persiste en el estado.
- `toast.promise(...)` retorna `{ id, unwrap }` cuando hay loading.
- `configureToaster` y `createToaster` son aliases.

#### Browser

- El IIFE expone `globalThis.Notify` con la shape correcta.
- `globalThis.Notify.toast('hello')` crea un toast real.

## Secuencia De Implementación Recomendada

1. Definir nombre, objetivo y API pública.
2. Definir qué entrypoints existirán realmente (root + browser + styles.css; nada más).
3. Crear `package.json`, `tsconfig.json`, `tsup.config.ts`, `vitest.config.ts`, `.prettierrc.js`, `.gitignore`, `.npmignore`.
4. Implementar el core compartido (`src/core/types.ts`, `constants.ts`, `dom-helpers.ts`, `icons.ts`, `state.ts`, `renderer.ts`).
5. Implementar la API vanilla (`src/api/*.ts`).
6. Implementar el bundle browser (`src/browser/*.ts`).
7. Escribir tests del core y luego de cada capa.
8. Redactar README y docs.
9. Verificar `build`, `typecheck`, `test` y el constraint scan.
10. Preparar publicación (manual).

## Checklist Final Antes De Considerar El Paquete Listo

1. El core resuelve el dominio sin dependencias de framework.
2. Cada subpath exportado tiene implementación, tipos y tests.
3. El README refleja exactamente los entrypoints reales.
4. No hay docs para variantes que no existen.
5. **No** hay peer dependencies de frameworks.
6. El bundle browser existe solo si fue realmente solicitado.
7. `prepublishOnly` pasa sin errores.
8. `package.json` publica solo lo necesario.
9. El constraint scan final pasa: cero React/Vue/Svelte en `package.json`, `src/`, `dist/`, `tsconfig.json`.

## Instrucción Operativa Para Futuras Conversaciones

Si voy a crear un paquete nuevo usando este blueprint, primero debo pedirte:

- el código fuente o la especificación funcional del paquete
- el nombre del paquete
- las dependencias a utilizar
- los frameworks o entornos a soportar (¡y confirmar que realmente se necesitan!)
- si quieres variante browser o CDN
- el alcance inicial exacto

Solo después de eso conviene generar el scaffold definitivo.
