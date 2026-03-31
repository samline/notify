import { sileoCore, SileoOptions } from '../src/core/sileo-core';

describe('SileoCore', () => {
  beforeEach(async () => {
    // Dismiss all toasts before each test and wait for exit
    const ids = sileoCore.getToasts().map(t => t.id);
    ids.forEach(id => sileoCore.dismiss(id));
    await new Promise(resolve => setTimeout(resolve, 650));
  });

  it('should show a toast with required options', () => {
    const id = sileoCore.show({ title: 'Test Toast', type: 'success' });
    const toasts = sileoCore.getToasts();
    expect(toasts.length).toBe(1);
    expect(toasts[0].id).toBe(id);
    expect(toasts[0].title).toBe('Test Toast');
    expect(toasts[0].type).toBe('success');
  });

  it('should dismiss a toast', () => {
    const id = sileoCore.show({ title: 'Dismiss Toast', type: 'info' });
    sileoCore.dismiss(id);
    // Wait for exit animation (600ms)
    return new Promise(resolve => setTimeout(resolve, 650)).then(() => {
      expect(sileoCore.getToasts().find(t => t.id === id)).toBeUndefined();
    });
  });

  it('should update an existing toast with the same title', () => {
    const id1 = sileoCore.show({ title: 'Unique', type: 'success' });
    const id2 = sileoCore.show({ title: 'Unique', type: 'error' });
    expect(id1).toBe(id2);
    const toasts = sileoCore.getToasts();
    expect(toasts.length).toBe(1);
    expect(toasts[0].type).toBe('error');
  });

  it('should handle multiple toasts with different titles', () => {
    sileoCore.show({ title: 'Toast 1', type: 'success' });
    sileoCore.show({ title: 'Toast 2', type: 'error' });
    const toasts = sileoCore.getToasts();
    expect(toasts.length).toBe(2);
    expect(toasts.some(t => t.title === 'Toast 1')).toBe(true);
    expect(toasts.some(t => t.title === 'Toast 2')).toBe(true);
  });

  it('should use default values if not provided', () => {
    const id = sileoCore.show({});
    const toast = sileoCore.getToasts().find(t => t.id === id);
    expect(toast).toBeDefined();
    expect(toast?.type).toBe('success');
  });
});
