import { notifyCore } from '../src/core/notify-core';

describe('Svelte Notify integration (core logic only)', () => {
  it('agrega un toast usando la API core', () => {
    notifyCore.show({ title: 'Svelte Toast', type: 'info' });
    const toasts = notifyCore.getToasts();
    expect(toasts.some(t => t.title === 'Svelte Toast')).toBe(true);
  });
});
