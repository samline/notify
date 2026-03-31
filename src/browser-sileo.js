// Exporta el core como UMD para uso vía CDN/browser
import { sileoCore } from "./core/sileo-core";

window.Sileo = sileoCore;

// Ejemplo de uso en HTML:
// <script src="agnostic-sileo.umd.js"></script>
// <script>
//   Sileo.show({ title: 'Hola', type: 'success' });
// </script>
