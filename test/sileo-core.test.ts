import { sileoCore } from '../src/core/sileo-core';

describe('SileoCore', () => {
  beforeEach(async () => {
    // Limpiar todos los toasts antes de cada test
    const ids = sileoCore.getToasts().map(t => t.id);
    ids.forEach(id => sileoCore.dismiss(id));
    await new Promise(res => setTimeout(res, 650));
  });

  it('muestra un toast con opciones mínimas', () => {
    const id = sileoCore.show({ title: 'Test Toast', type: 'success' });
    const toasts = sileoCore.getToasts();
    expect(toasts.length).toBe(1);
    expect(toasts[0].id).toBe(id);
    expect(toasts[0].title).toBe('Test Toast');
    expect(toasts[0].type).toBe('success');
  });

  it('descarta un toast', async () => {
    const id = sileoCore.show({ title: 'Dismiss Toast', type: 'info' });
    sileoCore.dismiss(id);
    await new Promise(res => setTimeout(res, 650));
    expect(sileoCore.getToasts().find(t => t.id === id)).toBeUndefined();
  });

  it('actualiza un toast existente con el mismo título', () => {
    const id1 = sileoCore.show({ title: 'Unique', type: 'success' });
    const id2 = sileoCore.show({ title: 'Unique', type: 'error' });
    expect(id1).toBe(id2);
    const toasts = sileoCore.getToasts();
    expect(toasts.length).toBe(1);
    expect(toasts[0].type).toBe('error');
  });

  it('maneja múltiples toasts con títulos diferentes', () => {
    sileoCore.show({ title: 'Toast 1', type: 'success' });
    sileoCore.show({ title: 'Toast 2', type: 'error' });
    const toasts = sileoCore.getToasts();
    expect(toasts.length).toBe(2);
    expect(toasts.some(t => t.title === 'Toast 1')).toBe(true);
    expect(toasts.some(t => t.title === 'Toast 2')).toBe(true);
  });

  it('usa valores por defecto si no se proveen', () => {
    const id = sileoCore.show({});
    const toast = sileoCore.getToasts().find(t => t.id === id);
    expect(toast).toBeDefined();
    expect(toast?.type).toBe('success');
  });
});
