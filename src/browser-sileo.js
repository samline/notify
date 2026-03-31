// Exports the core as UMD for CDN/browser usage
import { sileoCore } from "./core/sileo-core";

window.Sileo = sileoCore;

// Example usage in HTML:
// <script src="agnostic-sileo.umd.js"></script>
// <script>
//   Sileo.show({ title: 'Hello', type: 'success' });
// </script>
