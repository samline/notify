# 📦 Checklist de Publicación - @samline/notify

## ✅ Pre-Publicación (Verificado)

### Build & Distribution
- [x] Build script es cross-platform (Windows/Mac/Linux)
- [x] Todos los entrypoints generan correctamente
  - [x] `.` → dist/notify.{js,mjs,d.ts,d.mts}
  - [x] `./react` → dist/react.{js,mjs,d.ts,d.mts}
  - [x] `./vue` → dist/vue.{js,mjs,d.ts,d.mts}
  - [x] `./svelte` → dist/svelte.{js,mjs,d.ts,d.mts}
- [x] Browser bundle (dist/browser-notify.js) generado
- [x] Estilos CSS copiados a dist/
- [x] Build sin warnings críticos

### Configuración de Paquete
- [x] Nombre correcto: `@samline/notify` (scoped)
- [x] Versión: 0.1.5 (beta flag apropiado)
- [x] Keywords: toast, notification, react, vue, svelte, vanilla
- [x] Homepage y bugs URL configurados
- [x] Repository URL correcta
- [x] files: ["dist"] → solo distribuye build

### API & Entrypoints
- [x] Index agnóstico (no importa React)
- [x] react.ts exporta desde react-notify.tsx
- [x] vue.ts exporta desde vue-notify.ts
- [x] svelte.ts exporta desde svelte-notify.ts
- [x] showNotifyToast() consistente en todas las integraciones
- [x] Tipos exportados desde cada entrypoint

### Tipos TypeScript
- [x] Tipos principales en src/types.ts
- [x] NotifyButton.title (no .label)
- [x] NotifyPosition, NotifyState, NotifyStyles bien definidos
- [x] Exports de tipos desde core/notify-core.ts

### Documentación
- [x] README.md actualizado (Notify, no Sileo)
- [x] docs/react.md con ejemplos correctos
- [x] docs/vue.md con ejemplos correctos
- [x] docs/svelte.md con ejemplos correctos
- [x] docs/vanillajs.md con ejemplos correctos
- [x] docs/browser.md con ejemplos CDN
- [x] docs/api.md con referencia de tipos
- [x] Todos los ejemplos usan @samline/notify

### Testing
- [x] 9/9 tests passing
- [x] Tests para: vanilla, vue, svelte, react, core
- [x] Vitest configurado correctamente (jsdom)
- [x] Sin imports rotos

### Browser/CDN
- [x] window.notify.show() funciona
- [x] window.notify.dismiss() funciona
- [x] window.notify.clear() funciona
- [x] window.notify.subscribe() funciona
- [x] No expone clases internas

### Security & Quality
- [x] No hay archivos stub vacíos
- [x] No hay console.log() de debug
- [x] No hay vulnerabilidades XSS (usa textContent, no innerHTML)
- [x] Manejo seguro de tipos

---

## 🚀 Instrucciones para Publicar

### 1. Configurar credenciales npm
```bash
npm login
# Usa tu token/usuario de npm
```

### 2. Verificación final antes de publish
```bash
bun run test    # Todos los tests pasan
bun run build   # Build limpio sin errores
npm publish     # Publica a npm
```

### 3. Validar publicación
```bash
npm info @samline/notify
# Verifica que aparezca el paquete con versión 0.1.5
```

### 4. Probar instalación en proyecto nuevo
```bash
mkdir test-notify
cd test-notify
npm init -y
npm install @samline/notify
npm install @samline/notify/react  # Ejemplo React
```

---

## 📋 Cambios Implementados en esta Sesión

1. ✅ Build y exports multi-framework funcionales
2. ✅ Nombre de paquete correción: @samline/notify
3. ✅ Build script cross-platform (Windows/Mac/Linux)
4. ✅ Índice agnóstico (no React-specific)
5. ✅ Wrappers React/Vue/Svelte completados
6. ✅ Tipos unificados (no duplicados)
7. ✅ Button.title consistente (no .label)
8. ✅ Browser API segura
9. ✅ Documentación alineada
10. ✅ Tests validados (9/9 passing)

---

## 📊 Estado Final: ✅ LISTO PARA PRODUCCIÓN

**Veredicto:** El paquete está **completamente listo** para ser publicado en npm como **@samline/notify@0.1.5**

**Advertencia:** Esta es versión 0.x (beta/experimental). Considera actualizar a 1.0.0 cuando hayas recopilado feedback de usuarios.
