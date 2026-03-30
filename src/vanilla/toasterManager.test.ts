/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initToasters, notify } from '../vanilla/index';

describe('initToasters posiciones y fallback', () => {
  let root: HTMLElement;
  beforeEach(() => {
    root = document.createElement('div');
    document.body.appendChild(root);
  });

  it('usa fallback dinámico si solo hay una posición', () => {
    const mgr = initToasters(root, ['bottom-left']);
    notify({ title: 'Test fallback' });
    const container = root.querySelector('[data-position="bottom-left"]');
    expect(container?.textContent).toContain('Test fallback');
    mgr.destroy();
  });

  it('usa top-right como fallback si hay varias posiciones', () => {
    const mgr = initToasters(root, ['top-right', 'bottom-left']);
    notify({ title: 'Test top-right' });
    const container = root.querySelector('[data-position="top-right"]');
    expect(container?.textContent).toContain('Test top-right');
    mgr.destroy();
  });

  it('muestra advertencia si se notifica a posición no inicializada', () => {
    const mgr = initToasters(root, ['top-right']);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    notify({ title: 'Test warn', position: 'bottom-left' });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('no se inicializó ningún contenedor para esa posición'));
    warn.mockRestore();
    mgr.destroy();
  });
});
