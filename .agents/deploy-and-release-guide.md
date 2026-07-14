# Guía Interna De Release, Deploy Y Tags Para La IA

## Instrucción Para La IA

Este archivo existe para que la IA pueda revisar el proceso correcto de versionado, release y publicación antes de intentar desplegar una nueva versión del paquete.

Cuando una conversación pida publicar, desplegar, versionar o empujar un tag, la IA debe leer este documento y validar que el flujo propuesto coincide con el estado real del repositorio.

## Modelo Actual: Publish Manual

Desde el refactor 2026-07-13, el usuario hace el publish **manualmente** desde su máquina local. Este paquete sigue el mismo modelo que `@samline/forms`: **no** hay workflow de GitHub Actions para publicar, y la IA **no debe**:

1. Re-crear un workflow de publish automático en este repositorio.
2. Asumir que existe `NPM_TOKEN` configurado en GitHub Actions.
3. Empujar tags con la expectativa de que disparen una publicación.
4. Mencionar GitHub Actions como parte del flujo de release.
5. Correr `bun publish` ni `npm publish` por su cuenta.

> **Toolchain de release (2026-07-13):** el package manager canónico de este repo (y de todos los de `Packages/`) es **bun** (ver `.agents/lessons.md`). El publish puede hacerse con `bun publish` o `npm publish` — ambos leen `package.json` y producen el mismo tarball; la elección es del usuario. Los comandos de validación (build, typecheck, test) se ejecutan con `bun run X` para mantener la toolchain consistente.

## Regla Inicial Antes De Versionar

La IA no debe subir una nueva versión sin revisar primero el tipo de cambio.

Primero debe clasificar los cambios en una de estas categorías:

### Patch

Usar patch cuando hay:

- correcciones de bugs sin romper compatibilidad
- mejoras internas sin cambios en la API pública
- documentación o ajustes pequeños si también van acompañados de una corrección publicada
- fixes de build o testing que no cambian el contrato público

Ejemplo:

- 2.0.0 -> 2.0.1

### Minor

Usar minor cuando hay:

- nuevas funciones compatibles hacia atrás
- nuevos exports o nuevos helpers sin romper la API actual
- soporte adicional para otro entorno o framework sin cambiar contratos existentes
- mejoras relevantes del producto manteniendo compatibilidad

Ejemplo:

- 2.0.0 -> 2.1.0

### Major

Usar major cuando hay:

- cambios incompatibles con la API actual
- eliminación o renombre de funciones públicas
- cambios de comportamiento que puedan romper consumidores existentes
- cambios de runtime mínimo o de estrategia de imports que obliguen migración

Ejemplo:

- 2.0.0 -> 3.0.0

## Nota Sobre La Versión 2.0.0

La versión se reseteó a `2.0.0` por decisión explícita del usuario (2026-07-13) como baseline del refactor vanilla. La última publicada fue `2.0.3` (multi-framework); el refactor regresa a `2.0.0` para que cualquier consumidor de la multi-framework sepa que debe migrar.

> ⚠️ Esto **no** convierte el refactor en un minor — sigue siendo breaking porque elimina los subpaths `react`, `vue`, `svelte`. La decisión del usuario de llamarlo `2.0.0` es una convención de "fresh start dentro de 2.x", no un semver minor.

> La versión finalmente se publicó como `3.0.0` (decisión 2026-07-13 posterior al refactor) — la baseline conceptual es 2.0.0 pero el número publicado es 3.0.0.

## Checklist De Evaluación Semver

Antes de decidir la nueva versión, la IA debe responder:

1. ¿La API pública cambió de forma incompatible?
2. ¿Se eliminó o renombró algún export?
3. ¿Se añadió funcionalidad nueva sin romper compatibilidad?
4. ¿Solo se corrigieron bugs o detalles internos?
5. ¿Cambió la versión mínima de Node o alguna dependencia crítica?
6. ¿Cambió el comportamiento por defecto de una función pública?
7. ¿La documentación describe una nueva capacidad o una ruptura?

Regla práctica:

1. Si hay ruptura, major.
2. Si no hay ruptura pero sí nueva capacidad, minor.
3. Si solo hay corrección o ajuste compatible, patch.

## Secuencia Recomendada De Release (modelo manual)

### Paso 1: revisar el estado del repositorio

La IA debe comprobar:

1. rama actual
2. cambios sin commit
3. si el branch está alineado con origin
4. si hay tags locales o remotos pendientes de considerar

### Paso 2: revisar el alcance del cambio

La IA debe leer el diff o el resumen de cambios y clasificar el release como major, minor o patch.

No debe saltar directamente a `npm version` sin esa revisión.

### Paso 3: validar que el repositorio está listo

Antes de versionar, comprobar:

1. `bun run build`
2. `bun run typecheck`
3. `bun test`
4. **Constraint scan final:** correr los 5 greps del `package-replication-guide.md` para confirmar cero React/Vue/Svelte en `src/`, `dist/`, `package.json`, `tsconfig.json`.
5. **Toolchain check (decisión 2026-07-13):** confirmar que el lockfile es `bun.lock` y NO hay `package-lock.json`/`yarn.lock`/`pnpm-lock.yaml`/`bun.lockb` en el árbol. Si quedó alguno, la conversión a bun no se completó.

Si alguno falla, no se debe crear versión ni tag.

### Paso 4: actualizar las referencias de versión en el proyecto

**Crítico, paso previo al commit.** Antes de commitear un version bump se debe barrer y actualizar TODAS las referencias de versión en el proyecto — no solo `package.json`. Incluir como mínimo:

1. `README.md` — URL de CDN versionada.
2. `docs/browser.md` y `docs/getting-started.md` — ejemplos de CDN y unpkg.
3. `example/src/content/docs/...` — sitio Starlight si existe.
4. Cualquier otro archivo que contenga `@samline/notify@X.Y.Z` literal.

Confirmar con `grep -rn '@samline/notify@' .` (excluyendo `node_modules`, `dist`, `.git`).

### Paso 5: actualizar la versión

```bash
# Manual
# editar package.json y poner la nueva versión en "version"
```

O usando `npm version` (que también crea el commit y el tag si se le pide) — esto sigue siendo válido aunque el lockfile sea `bun.lock`:

```bash
npm version patch   # o minor / major
```

### Paso 6: commitear y empujar

```bash
git add .
git commit -m "chore: release vX.Y.Z"
git push origin main
```

### Paso 7: el usuario hace publish manualmente

La IA **no ejecuta** el publish. Cuando el commit y el push estén listos, la IA reporta al usuario y le pide que él/ella corra `bun publish` o `npm publish` (o `--dry-run` primero para revisar contenido) desde su terminal local.

El `prepublishOnly` del `package.json` ya encadena `clean → build → typecheck → test`, así que el publish no es riesgoso.

### Paso 8 (opcional): tag y push del tag

Si el usuario quiere mantener tags en el repo para Releases de GitHub / historial, se puede crear y empujar el tag después de la publicación manual:

```bash
git tag -a vX.Y.Z -m "vX.Y.Z - <summary>"
git push origin vX.Y.Z
```

Como no hay workflow de publish, empujar el tag **no dispara nada**. Es solo metadata.

## Relación Entre Tag Y package.json

En el modelo manual, el tag es opcional y puramente documental. Si se crea, debe coincidir con `package.json`:

- `package.json` version: `2.1.0`
- tag: `v2.1.0`

Si no coinciden, futuros consumidores del tag (links en docs, URLs de unpkg) pueden confundirse.

## Casos En Los Que No Debe Hacerse Release

La IA no debe crear versión nueva si ocurre alguno de estos casos:

1. solo hay cambios locales sin commit y no se pidió release real
2. el tipo de cambio todavía no está claro
3. build, typecheck o tests fallan
4. el constraint scan final encuentra React/Vue/Svelte en `src/`/`dist/`/`package.json`
5. `package.json` no está alineado con el release propuesto
6. el repositorio local no está en el commit correcto para etiquetar

## Comandos De Referencia

### Revisar estado

```bash
git status --short --branch
git log --oneline --decorate -5
git tag --sort=-version:refname | head
```

### Validar proyecto antes de release

```bash
bun run build
bun run typecheck
bun test

# Constraint scan (debe estar todo vacío):
grep -rE 'from .react|require..react|from .vue|require..vue|from .svelte|require..svelte|<[A-Z][A-Za-z]*[ />]' src/ test/ 2>/dev/null
grep -E '"(react|react-dom|vue|svelte|@vue/|@sveltejs/)"' package.json
grep -E '"jsx"' tsconfig.json
grep -rE 'react|vue|svelte' dist/ 2>/dev/null
find src/ test/ -name '*.tsx' -o -name '*.jsx' 2>/dev/null
```

### Confirmar que el package manager es bun (decisión 2026-07-13)

```bash
# Lockfiles que SÍ deben estar:
[ -f bun.lock ] && echo "OK: bun.lock presente" || echo "FALTA: bun.lock"

# Lockfiles que NO deben estar (todos en uno):
for f in package-lock.json yarn.lock pnpm-lock.yaml bun.lockb; do
  if [ -f "$f" ]; then echo "FALTA: borrar $f"; else echo "OK: sin $f"; fi
done
```

Si algún lockfile "viejo" quedó en el árbol, la conversión a bun no está completa y hay que repetirla antes de publicar.

## Regla Operativa Final Para La IA

Si una conversación futura pide publicar una nueva versión, la IA debe:

1. revisar este documento
2. clasificar el release como major, minor o patch
3. **barrer y actualizar todas las referencias de versión** (ver paso 4)
4. verificar build, typecheck y tests
5. correr el constraint scan final
6. confirmar que el lockfile es `bun.lock` y no hay lockfiles viejos
7. commitear + empujar
8. **pedirle al usuario que corra `bun publish` o `npm publish` manualmente** — no publicarlo ella misma
9. (opcional) ayudar con el tag y push del tag si el usuario lo pide

No debe tratar release, tag y deploy como un solo paso ciego. Tampoco debe re-introducir un workflow de publish automático — el usuario hace publish a mano.
