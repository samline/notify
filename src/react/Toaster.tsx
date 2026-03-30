import React, { useEffect, useState } from 'react';
import type { ToastItem } from '../core/index';
import { sileo } from '../core/index';
import { animate } from 'motion';


export interface ReactToasterProps {
  position?: string;
  offset?: number | string | { top?: number; right?: number; bottom?: number; left?: number };
  options?: Partial<import('../core/index').SileoOptions>;
  theme?: 'light' | 'dark' | 'system';
}


export const Toaster: React.FC<ReactToasterProps> = ({ position = 'top-right', offset, options, theme }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const lastSnapshot = React.useRef<string[]>([]);

  // Guardar defaults globales
  useEffect(() => {
    if (options) {
      (sileo as any)._globalOptions = options;
    }
    if (theme) {
      (sileo as any)._theme = theme;
    }
    return () => {
      if (options) delete (sileo as any)._globalOptions;
      if (theme) delete (sileo as any)._theme;
    };
  }, [options, theme]);

  useEffect(() => {
    const unsub = sileo.subscribe((items) => setToasts(items.filter((t) => (t.options.position || 'top-right') === position)));
    return () => { unsub(); };
  }, [position]);

  const handleDismiss = async (id: string) => {
    const el = document.querySelector(`[data-id="${id}"]`) as HTMLElement | null;
    if (el) {
      try {
        const a = animate(el, { opacity: [1, 0], transform: ['translateY(0px)', 'translateY(-8px)'] }, { duration: 0.15 });
        await (a as any).finished;
      } catch (e) { /* ignore */ }
    }
    sileo.dismiss(id);
  };

  // animate in newly added toasts
  useEffect(() => {
    const ids = toasts.map(t => t.id);
    const added = ids.filter(id => !lastSnapshot.current.includes(id));
    added.forEach(id => {
      const el = document.querySelector(`[data-id="${id}"]`) as HTMLElement | null;
      if (el) {
        // set initial state then animate
        el.style.opacity = '0';
        el.style.transform = 'translateY(-6px)';
        try {
          const a = animate(el, { opacity: [0, 1], transform: ['translateY(-6px)', 'translateY(0px)'] }, { duration: 0.22 });
          // ignore finished
        } catch (e) {}
      }
    });
    lastSnapshot.current = ids;
  }, [toasts]);

  // Calcular offset CSS
  let offsetStyle: React.CSSProperties = {};
  if (offset !== undefined) {
    if (typeof offset === 'number' || typeof offset === 'string') {
      offsetStyle = { margin: typeof offset === 'number' ? `${offset}px` : offset };
    } else if (typeof offset === 'object') {
      if (offset.top !== undefined) offsetStyle.marginTop = `${offset.top}px`;
      if (offset.right !== undefined) offsetStyle.marginRight = `${offset.right}px`;
      if (offset.bottom !== undefined) offsetStyle.marginBottom = `${offset.bottom}px`;
      if (offset.left !== undefined) offsetStyle.marginLeft = `${offset.left}px`;
    }
  }

  return (
    <div className="sileo-toaster" data-position={position} data-theme={theme || undefined} style={offsetStyle}>
      {toasts.map((t) => (
        <div key={t.id} className="sileo-toast" data-type={t.options.type} data-id={t.id}>
          {/* Badge/Icon */}
          {t.options.icon && (
            <span
              className={t.options.styles?.badge ? `sileo-toast-badge ${t.options.styles.badge}` : 'sileo-toast-badge'}
              style={t.options.fill ? { background: t.options.fill } : {}}
            >
              {typeof t.options.icon === 'string' ? (
                <span dangerouslySetInnerHTML={{ __html: t.options.icon }} />
              ) : t.options.icon}
            </span>
          )}
          <div style={{ flex: 1 }}>
            <div className={t.options.styles?.title ? `sileo-toast-header ${t.options.styles.title}` : 'sileo-toast-header'}>{t.options.title}</div>
            {t.options.description && (
              <div className={t.options.styles?.description ? `sileo-toast-desc ${t.options.styles.description}` : 'sileo-toast-desc'}>{t.options.description}</div>
            )}
          </div>
          {t.options.button && (
            <button
              className={t.options.styles?.button ? `sileo-toast-btn ${t.options.styles.button}` : 'sileo-toast-btn'}
              onClick={(e) => { e.stopPropagation(); t.options.button!.onClick(); }}
            >
              {t.options.button.title}
            </button>
          )}
          <button className="sileo-toast-close" onClick={() => handleDismiss(t.id)}>×</button>
        </div>
      ))}
    </div>
  );
};

export default Toaster;
