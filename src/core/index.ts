export type Position =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'loading' | 'action';

export interface ToastButton {
  title: string;
  onClick: () => void;
}

export interface ToastOptions {
  title?: string;
  description?: string;
  position?: Position;
  duration?: number | null; // ms, null = sticky
  type?: ToastType;
  button?: ToastButton;
  [key: string]: any;
}

export interface ToastItem {
  id: string;
  options: ToastOptions;
  createdAt: number;
}

type Listener = (items: ToastItem[]) => void;

class NotifyController {
  private toasts: ToastItem[] = [];
  private listeners = new Set<Listener>();
  private idCounter = 1;

  private nextId() {
    return `notify_${Date.now()}_${this.idCounter++}`;
  }

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    fn(this.toasts.slice());
    return () => this.listeners.delete(fn);
  }

  private notify() {
    const snapshot = this.toasts.slice();
    this.listeners.forEach((l) => l(snapshot));
  }

  getToasts() {
    return this.toasts.slice();
  }

  show(opts: ToastOptions): string {
    const id = this.nextId();
    const item: ToastItem = { id, options: { ...opts }, createdAt: Date.now() };
    this.toasts.push(item);
    this.notify();
    return id;
  }

  success(opts: ToastOptions) {
    return this.show({ ...opts, type: 'success' });
  }

  error(opts: ToastOptions) {
    return this.show({ ...opts, type: 'error' });
  }

  info(opts: ToastOptions) {
    return this.show({ ...opts, type: 'info' });
  }

  warning(opts: ToastOptions) {
    return this.show({ ...opts, type: 'warning' });
  }

  action(opts: ToastOptions) {
    return this.show({ ...opts, type: 'action' });
  }

  dismiss(id: string) {
    const idx = this.toasts.findIndex((t) => t.id === id);
    if (idx >= 0) {
      this.toasts.splice(idx, 1);
      this.notify();
    }
  }

  clear(position?: Position) {
    if (position) {
      this.toasts = this.toasts.filter((t) => t.options.position !== position);
    } else {
      this.toasts = [];
    }
    this.notify();
  }

  promise<T = any>(p: Promise<T>, opts: { loading: ToastOptions; success?: ToastOptions | ((r: T) => ToastOptions); error?: ToastOptions | ((e: any) => ToastOptions); position?: Position; }) {
    const loadingId = this.show({ ...(opts.loading || {}), type: 'loading', position: opts.position });
    p.then((res) => {
      this.dismiss(loadingId);
      const successOpt = typeof opts.success === 'function' ? (opts.success as any)(res) : opts.success;
      if (successOpt) this.show({ ...(successOpt || {}), type: 'success', position: opts.position });
    }).catch((err) => {
      this.dismiss(loadingId);
      const errorOpt = typeof opts.error === 'function' ? (opts.error as any)(err) : opts.error;
      if (errorOpt) this.show({ ...(errorOpt || {}), type: 'error', position: opts.position });
    });
    return p;
  }
}

export const notify = new NotifyController();
// backward compatibility alias
export const sileo = notify as unknown as NotifyController;

export default notify;
