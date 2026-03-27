import { sileo, ToastItem } from '../core/index';
import { animate } from 'motion';

const POSITIONS = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right'
] as const;

export type Position = typeof POSITIONS[number];

function createContainer(position: string, root: HTMLElement) {
  const c = document.createElement('div');
  c.className = 'sileo-toaster';
  c.setAttribute('data-position', position);
  c.setAttribute('role', 'status');
  c.setAttribute('aria-live', 'polite');
  return c;
}

function renderToast(item: ToastItem) {
  const el = document.createElement('div');
  el.className = 'sileo-toast';
  el.dataset.id = item.id;
  el.setAttribute('data-type', item.options.type || 'info');
  el.style.opacity = '0';
  el.style.transform = 'translateY(-6px)';

  const body = document.createElement('div');
  body.style.display = 'flex';
  body.style.flexDirection = 'column';
  body.style.flex = '1';

  const header = document.createElement('div');
  header.className = 'sileo-toast-header';
  header.textContent = item.options.title || '';

  body.appendChild(header);

  if (item.options.description) {
    const desc = document.createElement('div');
    desc.className = 'sileo-toast-desc';
    desc.textContent = item.options.description;
    body.appendChild(desc);
  }

  el.appendChild(body);

  if (item.options.button) {
    const btn = document.createElement('button');
    btn.className = 'sileo-toast-btn';
    btn.textContent = item.options.button.title;
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

  if (typeof item.options.duration === 'number') {
    if (item.options.duration > 0) {
      setTimeout(() => sileo.dismiss(item.id), item.options.duration);
    }
  }

  return el;
}

export function initToasters(root: HTMLElement = document.body, positions: Position[] = ['top-right']) {
  const containers: Record<string, HTMLElement> = {};

  positions.forEach((pos) => {
    const c = createContainer(pos, root);
    root.appendChild(c);
    containers[pos] = c;
  });

  function rerender(items: ToastItem[]) {
    positions.forEach((pos) => {
      const container = containers[pos];
      const visible = items.filter((t) => (t.options.position || 'top-right') === pos);

      // Diff existing children and animate out removed toasts
      const visibleIds = new Set(visible.map((v) => v.id));
      const existing = Array.from(container.children) as HTMLElement[];

      existing.forEach((child) => {
        const id = child.dataset.id;
        if (!id || !visibleIds.has(id)) {
          // animate out then remove
          animate(child, { opacity: 0, y: -8 }, { duration: 0.18 }).finished.then(() => child.remove());
        }
      });

      // Add new items
      visible.forEach((t) => {
        if (!container.querySelector(`[data-id="${t.id}"]`)) {
          const node = renderToast(t);
          container.appendChild(node);
          // animate in
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
