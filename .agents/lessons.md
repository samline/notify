# Lessons

## Instrucción Para La IA

Este archivo guarda lecciones operativas del proyecto para evitar repetir errores y para mantener presentes las recomendaciones del usuario durante futuras tareas.

La IA debe revisarlo antes de ejecutar trabajo importante y actualizarlo cuando el usuario marque un comportamiento como incorrecto, mejorable o deseable.

## Qué Debe Guardarse Aquí

1. errores de la IA que el usuario indique como tales
2. comportamientos que no deben repetirse
3. preferencias explícitas del usuario
4. recomendaciones prácticas para futuras sesiones
5. aclaraciones sobre cómo interpretar instrucciones del proyecto

## Regla De Uso

Solo deben registrarse lecciones confirmadas por el usuario o aprendidas con claridad durante el trabajo en este proyecto.

No deben agregarse opiniones vagas ni reglas inventadas.

Si la IA guarda en memoria de sesión una lección, preferencia o corrección operativa que deba sobrevivir a la sesión, también debe escribirla aquí para mantener la continuidad del proyecto.

## Lecciones Actuales

### Persistencia de contexto operativo

- lección: la memoria de sesión del chat puede perderse y no debe ser la única ubicación para información operativa importante.
- implicación: si una nota de sesión corresponde a un pendiente, lección, regla interna o preferencia persistente, la IA debe duplicarla en el archivo adecuado de `.agents/`.

### Documentos internos para la IA

- lección: los archivos dentro de `.agents/` son instrucciones internas para la IA, no documentación pública del paquete.
- implicación: la IA debe tratarlos como notas de operación y referencia antes de actuar.

### AGENTS.md versionado

- lección: a partir del 2026-07-13, `AGENTS.md` y `.agents/` SÍ se versionan. La antigua convención de mantenerlos fuera de Git está deprecada.
- implicación: `.gitignore` no debe ignorar `AGENTS.md` ni `.agents/`. Ambos deben aparecer en `.npmignore` para que no entren al tarball publicado.

### Honestidad sobre el estado de implementación

- lección: no afirmar que un cambio quedó escrito si no fue persistido realmente en el workspace.
- implicación: la IA debe reportar con precisión lo que sí quedó aplicado y lo que sigue pendiente.

### Pendientes explícitos

- lección: las tareas futuras deben quedar en `todo.md` solo si el usuario dijo explícitamente que quedan pendientes.
- implicación: la IA no debe promover ideas implícitas a backlog sin confirmación.

### Documentación pública en inglés

- lección: la documentación pública del paquete debe escribirse en inglés.
- implicación: README y `docs/` no deben mezclar español en futuras iteraciones. (Este archivo `.agents/lessons.md` puede seguir en español porque es interno.)

### TypeScript strict + verbatim module syntax + default exports

- lección: con `verbatimModuleSyntax: true` y `isolatedModules: true`, las re-exports de tipos requieren `export type { ... }` explícito; usar `export { type X }` inline en barrel files evita el error `TS1205: Re-exporting a type when 'verbatimModuleSyntax' is enabled requires using 'export type'`.
- implicación: en el barrel `src/index.ts`, separar tipos (`export type { ... }`) de valores (`export { ... }`). El compilador ya no infiere `import type` vs `import` por sí solo.

### Versiones del CDN en releases

- lección: cuando se cambia la versión publicada del paquete, también deben actualizarse las URLs versionadas del CDN en la documentación pública.
- implicación: antes de crear commit, tag o release, la IA debe revisar `README.md` y `docs/browser.md` para confirmar que las referencias a unpkg usan la misma versión que `package.json`. Confirmar con `grep -rn '@samline/notify@' .` (excluyendo `node_modules`, `dist`, `.git`).

### El usuario hace publish manualmente en este repo (decisión 2026-07-13)

- situación: el refactor de `@samline/notify` a vanilla sigue el mismo modelo de `@samline/forms`. El usuario hace publish localmente desde su propia terminal.
- regla a mantener en adelante:
  1. **No** re-introducir `.github/workflows/publish*.yml` (o equivalente) en este repo.
  2. La IA hace commit + push del código y la versión; el usuario hace publish desde su terminal.
  3. El tag sigue siendo opcional y puramente documental (ya no dispara nada). Si se crea, va después del publish manual.
  4. El `prepublishOnly` del `package.json` (que encadena `clean → build → typecheck → test`) sigue siendo válido y es la red de seguridad del publish manual.
  5. La IA no debe correr publish por su cuenta. Si el usuario pide release, terminar con: "listo, ya puedes correr `bun publish` o `npm publish` localmente".

### Este paquete es puramente vanilla — NO re-introducir React/Vue/Svelte (decisión 2026-07-13)

- situación: el refactor eliminó físicamente los subpaths `react/`, `vue/`, `svelte/` y reescribió el renderer sin JSX. La versión baseline conceptual es 2.0.0 pero el número publicado es 3.0.0.
- regla a mantener en adelante:
  1. El renderer (`src/core/renderer.ts`) manipula el DOM directamente con `createElement` + `appendChild`. **Nunca** usar `ReactNode`, `VNode`, `SvelteComponent`, ni JSX.
  2. Los iconos son **strings SVG** (funciones que devuelven HTML), no componentes.
  3. `Renderable = string | number | boolean | null | undefined` (más `HTMLElement` o `(container: HTMLElement) => void` para `custom`).
  4. El `package.json` **no** tiene `peerDependencies` ni `peerDependenciesMeta`. Si en el futuro se necesita un peer, debe ser opcional (`peerDependenciesMeta.optional: true`) y justificarse explícitamente.
  5. El constraint scan final (`grep -rE 'react|vue|svelte' dist/`, `grep -rE 'jsx' tsconfig.json`, etc.) es **parte del release gate** y debe estar vacío.
  6. Si el usuario pide en el futuro wrappers por framework, deben vivir en paquetes separados (`@samline/notify-react`, etc.) con su propio scaffold, no en este.

### Port 1:1 de `styles.css` es un contrato UI/UX innegociable

- situación: el renderer vanilla emite data-attributes (`[data-notify-toaster]`, `[data-notify-toast]`, `[data-icon]`, `[data-content]`, `[data-title]`, `[data-description]`, `[data-button]`, `[data-cancel]`, `[data-close-button]`) y el CSS los consume. Cambiar el CSS rompería a cualquier consumidor existente.
- regla a mantener en adelante:
  1. `src/styles.css` se preserva **byte-por-byte** del original. Cero modificaciones cosméticas.
  2. Si un data-attribute nuevo necesita estilo, se agrega **al final** del CSS sin tocar las reglas existentes.
  3. El renderer emite los data-attributes que el CSS ya espera — si falta alguno, ajustar el renderer, no el CSS.

### Renderer sin React: diff mínimo sobre `<li>` por id

- situación: el renderer React original usaba `useState` + reconciliación para mantener el DOM sincronizado con el estado. En vanilla hay que hacer un diff manual.
- regla a mantener en adelante:
  1. Por cada id en `state.toasts` que no está en `dismissedToasts`, debe existir un `<li data-notify-toast data-id="...">` en el DOM.
  2. Si un `<li>` ya existe para ese id, no se re-crea — solo se actualizan data-attributes y el contenido si cambió `type`/`title`/`description`/`action`/`cancel`.
  3. Si un id desaparece de `state.toasts` o entra en `dismissedToasts`, se aplica `data-removed="true"` y después de `TIME_BEFORE_UNMOUNT` se remueve del DOM.
  4. La comparación es **shallow** (JSON.stringify del snapshot relevante) — no se re-crea el `<li>` por cualquier cambio de identidad del objeto toast.
  5. `subscribers` del `Observer` reciben `{ id, type?, title?, ... }` o `{ id, dismiss: true }`. La firma del subscriber es la misma que el React original para mantener el contrato del estado.

### IIFE bundle: auto-mount con `createToaster()` es side-effect explícito

- situación: el bundle IIFE (`src/browser/global.ts`) está pensado para uso con `<script src="...">` y debe funcionar out-of-the-box.
- regla a mantener en adelante:
  1. El IIFE asigna `globalThis.Notify` con la shape completa (toast, Toaster, createToaster, configureToaster, getToaster, destroyToaster).
  2. Auto-monta un toaster con los options por defecto (`createToaster()` sin args) solo si `canUseDOM()`.
  3. El entrypoint root ESM/CJS (`src/index.ts`) **NO** auto-monta nada. Respetar `sideEffects: false` del `package.json`.
  4. Si `canUseDOM()` es `false` (SSR / Node), el IIFE solo exporta las funciones; no toca `globalThis` para evitar errores.

### Singleton vs factory para `Toaster`

- lección: la API usa un singleton interno (módulo `getToaster`/`createToaster` comparte la misma instancia) porque el caso de uso típico es un solo toaster por página.
- implicación: `createToaster(options?)` devuelve la misma instancia si ya existe (con `update(options)` aplicado). Para tests esto significa que **debe llamarse `resetToasts()`** entre casos para limpiar el state. El renderer también debe desmontar y limpiar listeners.

### `custom()` con `HTMLElement` o callback, NO con JSX

- lección: el estado original aceptaba `custom(jsx, data)` donde `jsx: (id) => ReactElement`. En vanilla no hay JSX.
- regla a mantener en adelante:
  1. `toast.custom(content, data?)` donde `content: HTMLElement | ((container: HTMLElement) => void)`.
  2. Si `content` es función, se llama con un `<div>` nuevo y el caller mete HTML dentro. El renderer detecta `data-custom` y omite iconos/description por defecto.
  3. Si `content` es `HTMLElement`, se mueve al `<li>` directamente.
  4. **No** aceptar strings HTML "peligrosas" — el caller debe crear el `HTMLElement` o usar el callback para que la API siga siendo safe-by-default.

### Timer de auto-dismiss: pausar en `mouseenter`/`focusin` y `document.hidden`

- lección: el timer JS debe pausarse cuando el usuario interactúa con el toast, o cuando la pestaña está oculta, para no perder notificaciones durante interrupciones.
- regla a mantener en adelante:
  1. El renderer mantiene un `setTimeout` por cada `<li>` activo.
  2. `pointerenter`/`focusin` en el `<li>` cancela el timer y guarda el tiempo restante.
  3. `pointerleave`/`focusout` lo reanuda con el tiempo restante.
  4. Listener global de `visibilitychange` cancela todos los timers activos cuando `document.hidden === true` y los reanuda cuando vuelve a `false`.
  5. Si el `duration` del toast cambia mientras corre, el timer se resetea con el nuevo valor.
  6. `prefers-reduced-motion: reduce` no desactiva los timers (sigue siendo UX), pero el CSS ya no anima la salida.

### Todos los paquetes dentro de `Packages/` deben usar bun como package manager (decisión 2026-07-13)

- situación: el usuario decidió (2026-07-13) que **este proyecto (`notify/`) y todos los demás proyectos dentro de la carpeta padre `Packages/`** deben usar **bun** como package manager. La conversión ya se aplicó a `notify/` (en este commit: se eliminó `package-lock.json`, se agregó `bun.lock`, y se borró `.local/` reemplazándolo por `.agents/`). Falta extender la conversión a los otros sub-paquetes que aún están en npm/yarn/pnpm.

- regla a mantener en adelante (aplica a TODOS los sub-paquetes de `Packages/`):
  1. **Lockfile canónico:** `bun.lock` (texto, git-friendly, default desde bun 1.2). **NO** commitear `bun.lockb` (binario legacy de bun ≤ 1.1), `package-lock.json` (npm), `yarn.lock` (yarn) ni `pnpm-lock.yaml` (pnpm).
  2. **Comando de install:** `bun install` (no `npm install`/`yarn`/`pnpm i`).
  3. **`.gitignore`:** ignorar `bun.lockb` (legacy binario) y `node_modules/`. **NO** ignorar `bun.lock` (texto) — ese SÍ se commitea. Tampoco ignorar `AGENTS.md` ni `.agents/` (estos SÍ se versionan a partir del 2026-07-13).
  4. **`.npmignore`:** excluir TODOS los lockfiles (`bun.lock`, `bun.lockb`, `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`) Y `AGENTS.md` Y `.agents/` para que el tarball publicado no incluya ninguno de estos.
  5. **Scripts:** pueden invocarse con `bun run X` o `npm run X` — ambos funcionan (bun es compatible con `npm run`). Para ser explícito sobre la toolchain, usar `bun run`. La elección no afecta el artefacto publicado.
  6. **Publish:** `bun publish` o `npm publish` — ambos leen `package.json` y producen el mismo tarball. La elección es del usuario; el `prepublishOnly` se ejecuta igual en ambos casos. La IA **no** corre el publish (ver lección "El usuario hace publish manualmente" más arriba).
  7. **El artefacto publicado (`dist/`) NO se ve afectado** por el cambio de package manager. Los lockfiles no entran al tarball.
  8. **Conversión limpia:** al convertir un paquete, borrar el lockfile viejo **del working tree y del commit de conversión** — no dejarlo como untracked ni siquiera ignorado. El `.gitignore` debe ignorar el formato binario viejo (`bun.lockb`) explícitamente para que un `git add -A` accidental no lo incluya.
  9. **No inventar `packageManager` field en `package.json`** sin que el usuario lo pida — es opcional. Si se agrega, debe matchear la versión de bun instalada en el entorno de release (verificar con `bun --version`).

- estado actual al 2026-07-13 (revisar antes de empezar una conversión de un paquete):
  - ✅ Ya en bun: `forms/` (`bun.lock` texto), `drawer/` y `ticker/` (`bun.lockb` binario, podrían migrarse a texto en una segunda pasada).
  - ⏳ Pendiente de conversión: `cleave-zen/` (yarn.lock), `date/`, `debounce/`, `docs-template/`, `docs/`, `is-visible/` (todos con `package-lock.json`), `formatter/` (mezcla `bun.lock` + `pnpm-lock.yaml` — eliminar el pnpm).
  - ⏸ `website test/` no es repo git y no tiene lockfile — omitido por ahora.

### `AGENTS.md` y `.agents/` se versionan; `.local/` está deprecado (decisión 2026-07-13)

- situación: la convención anterior (todo en `.local/`, fuera de git, incluyendo `AGENTS.md`) fue reemplazada el 2026-07-13. La nueva convención es: `AGENTS.md` y `.agents/` se commitean (versionados) pero se excluyen del tarball npm. `.local/` ya no se usa.
- regla a mantener en adelante:
  1. `.local/` no debe existir en ningún paquete de `Packages/`. Si vuelve a aparecer, hay que moverlo a `.agents/`.
  2. `AGENTS.md` es la puerta de entrada a las instrucciones para la IA; debe ser corto y enlazar a `.agents/agent-index.md`.
  3. `.agents/` contiene los documentos internos detallados (`agent-index.md`, `lessons.md`, `deploy-and-release-guide.md`, etc.). Todos versionados.
  4. `.gitignore` debe ignorar `node_modules/`, `bun.lockb`, `dist/`, etc. — pero **NO** `AGENTS.md` ni `.agents/`.
  5. `.npmignore` debe incluir `AGENTS.md` y `.agents/` para que no entren al tarball.

### `bun test` ≠ `bun run test` en proyectos con vitest (gotcha 2026-07-13)

- situación: bun trae un test runner nativo (`bun test`) que NO es compatible con la API de vitest (`expect`, `vi`, `describe`, `it`, `vi.fn`, etc.). Si uno corre `bun test` por reflejo en un proyecto que usa vitest, los tests fallan con errores crípticos (`expect() calls`, funciones no definidas, etc.) — no son bugs del código, es el runner equivocado.
- regla a mantener en adelante:
  1. En proyectos con vitest, **siempre** usar `bun run test` (que ejecuta el script `vitest run` del `package.json`). Nunca `bun test` directo.
  2. Si una sesión ya cometió el error, NO interpretar los fallos como bugs reales. Re-correr con `bun run test` para confirmar.
  3. En CI / pre-commit, los scripts deben seguir invocando `vitest run` directamente (o via `bun run test`) para evitar este mismatch.

## Cómo Añadir Nuevas Lecciones

Usar bloques simples con:

- situación
- error o preferencia detectada
- regla a mantener en adelante
