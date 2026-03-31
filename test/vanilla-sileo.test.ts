import { sileoCore } from '../src/core/sileo-core';

import { sileoCore } from '../src/core/sileo-core';

describe('Vanilla Sileo integration', () => {
  it('should add a toast using the core API (vanilla logic)', () => {
    sileoCore.show({ title: 'Vanilla Toast', type: 'success' });
    const toasts = sileoCore.getToasts();
    expect(toasts.some(t => t.title === 'Vanilla Toast')).toBe(true);
  });
});
