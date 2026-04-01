import { configureToaster, createToaster, destroyToaster, getToaster, toast } from '../index';

export const Sonner = {
  toast,
  createToaster,
  configureToaster,
  getToaster,
  destroyToaster,
};

declare global {
  interface Window {
    Sonner?: typeof Sonner;
  }
}

if (typeof window !== 'undefined') {
  window.Sonner = Sonner;
  createToaster();
}

export { configureToaster, createToaster, destroyToaster, getToaster, toast };