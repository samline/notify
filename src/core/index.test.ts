import { describe, it, expect } from 'vitest';
import { sileo } from './index';

describe('sileo core', () => {
  it('shows and dismisses a toast', () => {
    const id = sileo.success({ title: 't1' });
    const items = sileo.getToasts();
    expect(items.find((i) => i.id === id)).toBeDefined();
    sileo.dismiss(id);
    const after = sileo.getToasts();
    expect(after.find((i) => i.id === id)).toBeUndefined();
  });

  it('promise flow shows loading then result', async () => {
    const p = new Promise((resolve) => setTimeout(() => resolve('ok'), 50));
    const promise = sileo.promise(p as any, {
      loading: { title: 'loading' },
      success: { title: 'done' },
      error: { title: 'err' }
    });
    await promise;
    const items = sileo.getToasts();
    // success toast should be present
    expect(items.some((t) => t.options.title === 'done')).toBe(true);
  });
  it('supports icon, fill, styles, roundness, autopilot', () => {
    const id = sileo.success({
      title: 'icon',
      icon: '<svg></svg>',
      fill: '#123456',
      styles: { title: 'custom-title', badge: 'custom-badge' },
      roundness: 12,
      autopilot: true
    });
    const toast = sileo.getToasts().find((i) => i.id === id);
    expect(toast?.options.icon).toBe('<svg></svg>');
    expect(toast?.options.fill).toBe('#123456');
    expect(toast?.options.styles?.title).toBe('custom-title');
    expect(toast?.options.roundness).toBe(12);
    expect(toast?.options.autopilot).toBe(true);
    sileo.dismiss(id);
  });

  it('promise supports action', async () => {
    let actionCalled = false;
    const p = Promise.resolve('ok');
    await sileo.promise(p, {
      loading: { title: 'loading' },
      action: () => ({ title: 'action', button: { title: 'Do', onClick: () => { actionCalled = true; } } })
    });
    const items = sileo.getToasts();
    expect(items.some((t) => t.options.title === 'action')).toBe(true);
  });
});
