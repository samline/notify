import { configureToaster, createToaster, destroyToaster, getToaster, toast } from '../index';

export const Toaster = createToaster;

export const Notify = {
  toast,
  Toaster,
  createToaster,
  configureToaster,
  getToaster,
  destroyToaster,
};

declare global {
  interface Window {
    Notify?: typeof Notify;
  }
}

if (typeof window !== 'undefined') {
  window.Notify = Notify;
  createToaster();
}

export { configureToaster, createToaster, destroyToaster, getToaster, toast };