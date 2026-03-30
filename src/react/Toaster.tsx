import React, { useEffect, useState } from 'react';
import { GooeySVG } from './GooeySVG';
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

  // Inyectar SVG gooey filter solo una vez
  useEffect(() => {
    if (!document.getElementById('sileo-gooey-svg')) {
      const div = document.createElement('div');
      div.id = 'sileo-gooey-svg';
      div.style.position = 'absolute';
      div.style.width = '0';
      div.style.height = '0';
      div.innerHTML = `<svg width="0" height="0" style="position:absolute"><filter id="sileo-gooey"><feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" /><feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" /><feBlend in="SourceGraphic" in2="goo" /></filter></svg>`;
      document.body.appendChild(div);
    }
  }, []);

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
      {/* Opcional: <GooeySVG /> para SSR, pero ya se inyecta en el DOM */}
      {toasts.map((t) => {
        // Badge SVG animado y soporte para fill, roundness, icono por tipo
        const badgeIcon = t.options.icon
          ? (typeof t.options.icon === 'string' ? <span dangerouslySetInnerHTML={{ __html: t.options.icon }} /> : t.options.icon)
          : {
              success: <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#16a34a"/><path d="M6 10.5l2.5 2.5 5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>,
              error:   <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#ef4444"/><path d="M7 7l6 6M13 7l-6 6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>,
              info:    <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#2563eb"/><text x="10" y="15" textAnchor="middle" fontSize="12" fill="#fff">i</text></svg>,
              warning: <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#f59e0b"/><path d="M10 6v4m0 3h.01" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>,
              action:  <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#6366f1"/><path d="M7 10h6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>,
              loading: <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" stroke="#fff" strokeWidth="3" opacity=".3"/><path d="M18 10a8 8 0 1 1-8-8" stroke="#fff" strokeWidth="3"/></svg>,
            }[t.options.type || 'info'];
        return (
          <div
            key={t.id}
            className="sileo-toast"
            data-type={t.options.type}
            data-id={t.id}
            style={{
              ...(t.options.fill ? { background: t.options.fill } : {}),
              ...(t.options.roundness ? { borderRadius: t.options.roundness, '--sileo-roundness': t.options.roundness + 'px' } as any : {}),
              filter: 'url(#sileo-gooey)',
            }}
          >
            <span
              className={t.options.styles?.badge ? `sileo-toast-badge ${t.options.styles.badge}` : 'sileo-toast-badge'}
              data-sileo-badge=""
            >
              {badgeIcon}
            </span>
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
        );
      })}
    </div>
  );
};

export default Toaster;
