import { notifyCore } from '../src/core/notify-core';

describe('NotifyCore', () => {
  beforeEach(async () => {
    // Limpiar todos los toasts antes de cada test
    const ids = notifyCore.getToasts().map(t => t.id);
    ids.forEach(id => notifyCore.dismiss(id));
    await new Promise(res => setTimeout(res, 650));
  });

  it('muestra un toast con opciones mínimas', () => {
    const id = notifyCore.show({ title: 'Test Toast', type: 'success' });
    const toasts = notifyCore.getToasts();
    expect(toasts.length).toBe(1);
    expect(toasts[0].id).toBe(id);
    expect(toasts[0].title).toBe('Test Toast');
    expect(toasts[0].type).toBe('success');
  });

  it('descarta un toast', async () => {
    const id = notifyCore.show({ title: 'Dismiss Toast', type: 'info' });
    notifyCore.dismiss(id);
    await new Promise(res => setTimeout(res, 650));
    expect(notifyCore.getToasts().find(t => t.id === id)).toBeUndefined();
  });

  it('actualiza un toast existente con el mismo título', () => {
    const id1 = notifyCore.show({ title: 'Unique', type: 'success' });
    const id2 = notifyCore.show({ title: 'Unique', type: 'error' });
    expect(id1).toBe(id2);
    const toasts = notifyCore.getToasts();
    expect(toasts.length).toBe(1);
    expect(toasts[0].type).toBe('error');
  });

  it('maneja múltiples toasts con títulos diferentes', () => {
    notifyCore.show({ title: 'Toast 1', type: 'success' });
    notifyCore.show({ title: 'Toast 2', type: 'error' });
    const toasts = notifyCore.getToasts();
    expect(toasts.length).toBe(2);
    expect(toasts.some(t => t.title === 'Toast 1')).toBe(true);
    expect(toasts.some(t => t.title === 'Toast 2')).toBe(true);
  });

  it('usa valores por defecto si no se proveen', () => {
    const id = notifyCore.show({});
    const toast = notifyCore.getToasts().find(t => t.id === id);
    expect(toast).toBeDefined();
    expect(toast?.type).toBe('success');
  });
});
