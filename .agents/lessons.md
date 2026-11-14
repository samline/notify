# Lessons

- Keep numeric and string toast IDs distinct internally even though `data-id` serializes both to text.
- Timer pauses must store a deadline and subtract elapsed time before resuming.
- `ToasterController.update()` is partial: omitted offsets, gaps, styles, and subscriptions must remain unchanged.
- Tests for browser globals and package exports must execute built artifacts, not only TypeScript source modules.
- CDN examples must reference an actually published version or `latest`; a package version in Git does not imply npm availability.
- GitHub only discovers Actions workflows under the repository-root `.github/workflows`; website commands run from `site` and Pages uploads `site/landing/dist`.
- Astro 7 documentation jobs require Node.js 22.12.0 or newer; keep CI, Pages deployment, and `site` engine metadata aligned.

- Test standalone globals as classic scripts in a real browser: JSDOM eval can conceal a bundler namespace overwriting window.Notify.
- Promise completion must retain record identity and reset epoch across async formatters; dismissal, reset, replacement and teardown revoke ownership.
- Hidden and exiting toast actions must be inert; keyboard shortcuts target the front visible record.
- Canonical docs live in docs/. Run site sync:docs after edits, check exact synchronization and historical route/fragment mappings, and execute the exact copied ESM/CDN sources.
- A CSS fingerprint validates styles, not useful demos or complete documentation. Compare full compositions against Ticker/Drawer, review prose and exercise task outcomes and lifecycle cleanup.
- Check visible documentation installers during delayed initialization, not only Home tabs. Render fallback panel labels inside noscript so assigning tabpanel roles does not remove a painted label and shift the first code frame. Preserve both no-JavaScript readability and protected styles.

- For the Notify gallery, review capability → consumer task → observable outcome → copied source → lifecycle. A count of presets, export inventory, green link checks and style hashes cannot establish task depth or visual reading quality. Keep composed decisions, cancellation, results, editable custom content and stack interaction covered.
- Responsive review must open notifications and inspect their usable text width, not only document overflow. Two actions previously reduced the message to about 60 px at 320 px despite passing overflow checks; keep the separate action row and built-browser reading-width regression.
- Custom content factories can run again after controller updates. Each render must release its listeners; preserve draft state outside the factory and dispose render listeners on replacement, dismissal and integration teardown.

- La auditoría de accesibilidad debe abrir las notificaciones y expandir las cinco variantes semánticas en ambos temas: una página sin toasts no detecta fallos de contraste del paquete. Las recetas deben compilar contra los tipos reales; un registro de exports o un import resuelto como any no comprueba su corrección.
- En desarrollo, Docs usa otra base y origen. Comprobar los assets públicos referenciados (incluido favicon), además de los enlaces de navegación; producción combina ambos sitios bajo una sola base.

- Los previews que siguen el tema de la página deben actualizar preferencias sin reenviar duration: enviarla reinicia los timers. Exigir que una regresión falle contra el artefacto anterior antes de aceptar su verde; la prueba final del plazo usa tiempo real.

- La revisión visual no se cierra con fingerprints o tests verdes: comprobar inputs/selects reales, superficie semántica, fuente válida, flecha separada con padding reservado, cursores pointer/text/not-allowed, hover/foco y disabled. Revisar también el ancho útil del valor a 320 px y 200%: un campo sin overflow podía dejar solo 64 px para texto. Comparar las fuentes fijadas de Ticker/Drawer y revisar los archivos copiados además del preview.

- Lifecycle callbacks (`onDismiss`) belong in the shared state, not in renderers: a per-renderer call fires once per mounted toaster and never without one.
- Never put an `aria-label` on a toast item: it replaces the description, actions and custom content for screen readers.
- Home's first playground tab is the Toast types panel; e2e tests that use a scenario preset on Home must select its tab first.
- `npm run check:release` compares sha256 hashes of reviewed sources recorded in `site/content-audit.json`. After reviewing edits to README.md, docs/ or shared visual sources, refresh those hashes in the same commit or CI fails.
- Playwright `grep` also matches the project name: never name a project with a word its own `grep` filters on.
- Copied CDN examples are tested against this checkout's `dist/`, so the CI browser jobs build the package first.
- Never add AI co-author or "Generated with" lines to commits, tags or PRs (maintainer rule, also in ~/.claude/CLAUDE.md).

- At 320px and 200% text, a persistent custom toast can cover its underlying preview reset. Browser flows must use the card's own visible close control before clicking the page beneath it; never force the covered reset or hide the failure with retries/timeouts. Five repeated runs and the complete scenarios project verify this sequence.

- Copied examples must read like code a visitor would write. `site/shared/lib/demo-behavior.js` holds one short `<preset>Demo` function per `#region` (plus the `demo` helper region); `demo-files.ts` copies the helper and the chosen region verbatim. Do not go back to one large shared handler pruned by an AST transform, and keep site-only concerns (page theme, baseline toaster options shared by previews) in the Playground host, not in the scenarios. Forms and Utils already use the same region pattern.
