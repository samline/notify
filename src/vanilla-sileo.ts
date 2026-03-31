// Wrapper VanillaJS para Sileo
// Permite mostrar toasts usando solo JS puro y manipulación de DOM
import { sileoCore, SileoOptions } from "./core/sileo-core";

export function showSileoToast(options) {
  const id = sileoCore.show(options);
  // Renderizar el toast en el DOM (ejemplo básico)
  // Aquí deberías crear el HTML y estilos necesarios
  // Este es solo un placeholder para la integración real
  const toast = document.createElement("div");
  toast.className = "sileo-toast";
  toast.innerText = options.title || options.type || "Toast";
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.remove();
    sileoCore.dismiss(id);
  }, options.duration || 3000);
  return id;
}

// Suscripción para escuchar cambios (opcional)
export function onSileoToastsChange(fn) {
  return sileoCore.subscribe(fn);
}
