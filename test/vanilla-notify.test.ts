import { notifyCore } from '../src/core/notify-core';

describe('Vanilla Notify integration', () => {
  it('agrega un toast usando la API core', () => {
    notifyCore.show({ title: 'Vanilla Toast', type: 'success' });
    const toasts = notifyCore.getToasts();
    expect(toasts.some(t => t.title === 'Vanilla Toast')).toBe(true);
  });
});
