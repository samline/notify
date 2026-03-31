import { sileoCore } from '../src/core/sileo-core';

describe('Svelte Sileo integration (core logic only)', () => {
  it('agrega un toast usando la API core', () => {
    sileoCore.show({ title: 'Svelte Toast', type: 'info' });
    const toasts = sileoCore.getToasts();
    expect(toasts.some(t => t.title === 'Svelte Toast')).toBe(true);
  });
});
