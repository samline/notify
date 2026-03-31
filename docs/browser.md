# Sileo - Browser (CDN)

## Instalación

Incluye el archivo UMD generado (`dist/browser-sileo.js`) en tu HTML:

```html
<script src="dist/browser-sileo.js"></script>
```

## Uso básico

```html
<script>
  Sileo.show({ title: 'Hola desde Browser/CDN', type: 'success', duration: 2000 });
</script>
```

## Opciones disponibles

- `title`, `type`, `description`, `duration`, `position`, `styles`, `fill`, `roundness`, `autopilot`, `button` (ver [API general](../README.md#api-general))

## Ejemplo avanzado

```html
<script>
  Sileo.show({
    title: 'Acción',
    description: 'Haz clic en el botón',
    type: 'action',
    button: {
      title: 'Aceptar',
      onClick: function() { alert('¡Aceptado!'); }
    },
    fill: '#e0ffe0',
    roundness: 22,
    duration: 5000
  });
</script>
```
