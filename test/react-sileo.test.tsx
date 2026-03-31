import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Toaster, showSileoToast } from '../src/toast';

// Mocks para window.matchMedia y window.ResizeObserver en entorno jsdom
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe('React Sileo integration', () => {
  it('debe renderizar Toaster y mostrar un toast', async () => {
    render(<>
      <Toaster position="top-right" />
      <button onClick={() => showSileoToast({ title: 'Toast React', type: 'success' })}>
        Mostrar Toast
      </button>
    </>);

    fireEvent.click(screen.getByText('Mostrar Toast'));
    const toast = await screen.findByText('Toast React');
    expect(toast).toBeInTheDocument();
  });
});
