import { sileoCore } from '../src/core/sileo-core';

describe('Vanilla Sileo integration', () => {
  it('agrega un toast usando la API core', () => {
    sileoCore.show({ title: 'Vanilla Toast', type: 'success' });
    const toasts = sileoCore.getToasts();
    expect(toasts.some(t => t.title === 'Vanilla Toast')).toBe(true);
  });
});
