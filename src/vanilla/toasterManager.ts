import { sileo, ToastItem } from '../core/index';
import { animate } from 'motion';

import { gooeySVG } from './gooeySVG';

const POSITIONS = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right'
] as const;

export type Position = typeof POSITIONS[number];

function createContainer(position: string, root: HTMLElement, opts?: { offset?: number | string | { top?: number; right?: number; bottom?: number; left?: number }, theme?: string, options?: any }) {
  const c = document.createElement('div');
  c.className = 'sileo-toaster';
  c.setAttribute('data-position', position);
  c.setAttribute('role', 'status');
  c.setAttribute('aria-live', 'polite');
  if (opts?.theme) c.setAttribute('data-theme', opts.theme);
  // offset
  if (opts?.offset !== undefined) {
    if (typeof opts.offset === 'number' || typeof opts.offset === 'string') {
      c.style.margin = typeof opts.offset === 'number' ? `${opts.offset}px` : opts.offset;
    } else if (typeof opts.offset === 'object') {
      if (opts.offset.top !== undefined) c.style.marginTop = `${opts.offset.top}px`;
      if (opts.offset.right !== undefined) c.style.marginRight = `${opts.offset.right}px`;
      if (opts.offset.bottom !== undefined) c.style.marginBottom = `${opts.offset.bottom}px`;
      if (opts.offset.left !== undefined) c.style.marginLeft = `${opts.offset.left}px`;
    }
  }
  // Aplica el filtro gooey a los toasters
  c.style.filter = 'url(#sileo-gooey)';
  return c;
}

function renderToast(item: ToastItem) {
  const el = document.createElement('div');
  el.className = 'sileo-toast';
  el.dataset.id = item.id;
  el.setAttribute('data-type', item.options.type || 'info');
  el.style.opacity = '0';
  el.style.transform = 'translateY(-6px)';

  // Soporte visual para fill y roundness
  if (item.options.fill) {
    el.style.background = item.options.fill;
  }
  if (item.options.roundness) {
    el.style.borderRadius = item.options.roundness + 'px';
    el.style.setProperty('--sileo-roundness', item.options.roundness + 'px');
  }

  // Badge SVG animado (efecto Sileo)
  const badge = document.createElement('div');
  badge.className = 'sileo-toast-badge';
  badge.setAttribute('data-sileo-badge', '');
  // Icono SVG custom o por tipo
  if (item.options.icon) {
    if (typeof item.options.icon === 'string') {
      badge.innerHTML = item.options.icon;
    } else if (item.options.icon instanceof HTMLElement) {
      badge.appendChild(item.options.icon);
    }
  } else {
    // Icono por tipo (ejemplo simple, puedes mejorar SVGs)
    badge.innerHTML = {
      success: '<svg width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#16a34a"/><path d="M6 10.5l2.5 2.5 5-5" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>',
      error:   '<svg width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#ef4444"/><path d="M7 7l6 6M13 7l-6 6" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>',
      info:    '<svg width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#2563eb"/><text x="10" y="15" text-anchor="middle" font-size="12" fill="#fff">i</text></svg>',
      warning: '<svg width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#f59e0b"/><path d="M10 6v4m0 3h.01" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>',
      action:  '<svg width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#6366f1"/><path d="M7 10h6" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>',
      loading: '<svg width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" stroke="#fff" stroke-width="3" opacity=".3"/><path d="M18 10a8 8 0 1 1-8-8" stroke="#fff" stroke-width="3"/></svg>',
    }[item.options.type || 'info'] || '';
  }

  // Aplica clases custom de styles.badge si existen
  if (item.options.styles && item.options.styles.badge) {
    badge.className += ' ' + item.options.styles.badge;
  }

  // Cuerpo del toast
  const body = document.createElement('div');
  body.style.display = 'flex';
  body.style.flexDirection = 'column';
  body.style.flex = '1';

  const header = document.createElement('div');
  header.className = 'sileo-toast-header';
  header.textContent = item.options.title || '';
  if (item.options.styles && item.options.styles.title) {
    header.className += ' ' + item.options.styles.title;
  }
  body.appendChild(header);

  if (item.options.description) {
    const desc = document.createElement('div');
    desc.className = 'sileo-toast-desc';
    desc.textContent = item.options.description;
    if (item.options.styles && item.options.styles.description) {
      desc.className += ' ' + item.options.styles.description;
    }
    body.appendChild(desc);
  }

  el.appendChild(badge);
  el.appendChild(body);

  if (item.options.button) {
    const btn = document.createElement('button');
    btn.className = 'sileo-toast-btn';
    btn.textContent = item.options.button.title;
    if (item.options.styles && item.options.styles.button) {
      btn.className += ' ' + item.options.styles.button;
    }
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      try {
        if (item.options.button && typeof item.options.button.onClick === 'function') {
          item.options.button.onClick();
        }
      } catch (err) { console.error(err); }
    });
    el.appendChild(btn);
  }

  const close = document.createElement('button');
  close.className = 'sileo-toast-close';
  close.innerHTML = '×';
  close.addEventListener('click', () => sileo.dismiss(item.id));
  el.appendChild(close);

  // Soporte para autopilot: expansión/colapso automático (simulado)
  if (item.options.autopilot !== false) {
    setTimeout(() => {
      el.style.transform = 'scale(1.03)';
      el.style.transition = 'transform 0.18s cubic-bezier(.22,1,.36,1)';
      setTimeout(() => {
        el.style.transform = 'scale(1)';
      }, 180);
    }, 120);
  }

  if (typeof item.options.duration === 'number') {
    if (item.options.duration > 0) {
      setTimeout(() => sileo.dismiss(item.id), item.options.duration);
    }
  }

  return el;
}

export function initToasters(root: HTMLElement = document.body, positions: Position[] = ['top-right'], opts?: { offset?: number | string | { top?: number; right?: number; bottom?: number; left?: number }, theme?: string, options?: any }) {
  const containers: Record<string, HTMLElement> = {};

  // Inyecta el SVG filter gooey solo una vez
  if (!document.getElementById('sileo-gooey-svg')) {
    const div = document.createElement('div');
    div.id = 'sileo-gooey-svg';
    div.style.position = 'absolute';
    div.style.width = '0';
    div.style.height = '0';
    div.innerHTML = gooeySVG;
    document.body.appendChild(div);
  }

  positions.forEach((pos) => {
    const c = createContainer(pos, root, opts);
    root.appendChild(c);
    containers[pos] = c;
  });
  if (opts?.options) (window as any).sileo._globalOptions = opts.options;
  if (opts?.theme) (window as any).sileo._theme = opts.theme;

  // fallback dinámico: si solo hay una posición, usarla como default
  const fallbackPosition = positions.length === 1 ? positions[0] : 'top-right';

  function rerender(items: ToastItem[]) {
    // Lanzar advertencia para todos los toasts con posición no inicializada
    items.forEach((t) => {
      if (t.options.position && !containers[t.options.position]) {
        console.warn(
          `[sileo] Toast con posición "${t.options.position}" pero no se inicializó ningún contenedor para esa posición. Inicializa con initToasters(..., ['${t.options.position}']) para mostrarlo.`
        );
      }
    });
    positions.forEach((pos) => {
      const container = containers[pos];
      // fallback dinámico
      const visible = items.filter((t) => (t.options.position || fallbackPosition) === pos);

      // Diff existing children y animar salida de toasts removidos
      const visibleIds = new Set(visible.map((v) => v.id));
      const existing = Array.from(container.children) as HTMLElement[];

      existing.forEach((child) => {
        const id = child.dataset.id;
        if (!id || !visibleIds.has(id)) {
          // animar salida y luego remover
          animate(child, { opacity: 0, y: -8 }, { duration: 0.18 }).finished.then(() => child.remove());
        }
      });

      // Añadir nuevos toasts
      visible.forEach((t) => {
        if (!container.querySelector(`[data-id="${t.id}"]`)) {
          const node = renderToast(t);
          container.appendChild(node);
          // animar entrada
          requestAnimationFrame(() => {
            animate(node, { opacity: [0, 1], y: [-6, 0] }, { duration: 0.24 });
          });
        }
      });
    });
  }

  const unsub = sileo.subscribe(rerender);

  return {
    destroy() {
      unsub();
      Object.values(containers).forEach((c) => c.remove());
    }
  };
}

export { POSITIONS };
