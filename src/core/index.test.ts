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
});
