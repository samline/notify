// Renderizador plug-and-play para VanillaJS
// Permite mostrar todos los toasts activos en el DOM automáticamente
import { notifyCore } from "./core/notify-core";

let container = null;

export function renderNotifyToasts() {
  if (!container) {
    container = document.createElement("div");
    container.className = "notify-toasts";
    Object.assign(container.style, {
      position: "fixed",
      top: "1rem",
      right: "1rem",
      zIndex: 9999,
    });
    document.body.appendChild(container);
  }
  function render(toasts) {
    container.innerHTML = "";
    toasts.forEach((toast) => {
      const el = document.createElement("div");
      el.className = `notify-toast ${toast.type || ''}`;
      el.style.background = "#fff";
      el.style.borderRadius = "8px";
      el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
      el.style.marginBottom = "1rem";
      el.style.padding = "1rem 1.5rem";
      el.style.minWidth = "220px";
      el.style.maxWidth = "320px";
      el.style.display = "flex";
      el.style.flexDirection = "column";
      el.style.gap = "0.5rem";
      const title = document.createElement("div");
      title.className = "notify-toast-title";
      title.style.fontWeight = "bold";
      title.textContent = toast.title;
      el.appendChild(title);
      if (toast.description) {
        const desc = document.createElement("div");
        desc.className = "notify-toast-description";
        desc.style.fontSize = "0.95em";
        desc.style.color = "#555";
        desc.textContent = toast.description;
        el.appendChild(desc);
      }
      if (toast.button) {
        const btn = document.createElement("button");
        btn.textContent = toast.button.title;
        btn.onclick = () => {
          if (typeof toast.button.onClick === "function") toast.button.onClick();
          notifyCore.dismiss(toast.id);
        };
        el.appendChild(btn);
      }
      const close = document.createElement("button");
      close.className = "notify-toast-close";
      close.textContent = "×";
      close.style.alignSelf = "flex-end";
      close.style.background = "none";
      close.style.border = "none";
      close.style.fontSize = "1.2em";
      close.style.cursor = "pointer";
      close.onclick = () => notifyCore.dismiss(toast.id);
      el.appendChild(close);
      container.appendChild(el);
    });
  }
  render(notifyCore.getToasts());
  return notifyCore.subscribe(render);
}
