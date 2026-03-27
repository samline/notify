import React, { useEffect, useState } from 'react';
import type { ToastItem } from '../core/index';
import { sileo } from '../core/index';
import { animate } from 'motion';

export interface ReactToasterProps {
  position?: string;
}

export const Toaster: React.FC<ReactToasterProps> = ({ position = 'top-right' }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const lastSnapshot = React.useRef<string[]>([]);

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

  return (
    <div className="sileo-toaster" data-position={position}>
      {toasts.map((t) => (
        <div key={t.id} className="sileo-toast" data-type={t.options.type} data-id={t.id}>
          <div style={{ flex: 1 }}>
            <div className="sileo-toast-header">{t.options.title}</div>
            {t.options.description && <div className="sileo-toast-desc">{t.options.description}</div>}
          </div>
          {t.options.button && (
            <button className="sileo-toast-btn" onClick={(e) => { e.stopPropagation(); t.options.button!.onClick(); }}>{t.options.button.title}</button>
          )}
          <button className="sileo-toast-close" onClick={() => handleDismiss(t.id)}>×</button>
        </div>
      ))}
    </div>
  );
};

export default Toaster;
