export type Position =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'loading' | 'action';


// SileoButton
export interface SileoButton {
  title: string;
  onClick: () => void;
}

// SileoStyles
export interface SileoStyles {
  title?: string;
  description?: string;
  badge?: string;
  button?: string;
}

// ToastOptions/SileoOptions
export interface SileoOptions {
  title?: string;
  description?: any; // ReactNode | string | unknown framework node
  position?: Position;
  duration?: number | null;
  type?: ToastType;
  button?: SileoButton;
  icon?: any; // ReactNode | SvelteComponent | VueComponent | string (SVG)
  fill?: string;
  styles?: SileoStyles;
  roundness?: number;
  autopilot?: boolean | object;
  [key: string]: any;
}

// SileoPromiseOptions
export interface SileoPromiseOptions<T = unknown> {
  loading: SileoOptions;
  success: SileoOptions | ((data: T) => SileoOptions);
  error: SileoOptions | ((err: unknown) => SileoOptions);
  action?: SileoOptions | ((data: T) => SileoOptions);
  position?: Position;
}

// Alias para compatibilidad
export type ToastButton = SileoButton;
export type ToastOptions = SileoOptions;

export interface ToastItem {
  id: string;
  options: ToastOptions;
  createdAt: number;
}

type Listener = (items: ToastItem[]) => void;

class NotifyController {
  public toasts: ToastItem[] = [];
  public listeners = new Set<Listener>();
  public idCounter = 1;

  public nextId() {
    return `notify_${Date.now()}_${this.idCounter++}`;
  }

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    fn(this.toasts.slice());
    return () => this.listeners.delete(fn);
  }

  public notify() {
    const snapshot = this.toasts.slice();
    this.listeners.forEach((l) => l(snapshot));
  }

  getToasts() {
    return this.toasts.slice();
  }

  show(opts: ToastOptions): string {
    // Normalizar props avanzadas
    const {
      icon,
      fill,
      styles,
      roundness,
      autopilot,
      ...rest
    } = opts;
    const id = this.nextId();
    const item: ToastItem = {
      id,
      options: {
        ...rest,
        ...(icon !== undefined ? { icon } : {}),
        ...(fill !== undefined ? { fill } : {}),
        ...(styles !== undefined ? { styles } : {}),
        ...(roundness !== undefined ? { roundness } : {}),
        ...(autopilot !== undefined ? { autopilot } : {}),
      },
      createdAt: Date.now(),
    };
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

  promise<T = any>(
    p: Promise<T>,
    opts: {
      loading: ToastOptions;
      success?: ToastOptions | ((r: T) => ToastOptions);
      error?: ToastOptions | ((e: any) => ToastOptions);
      action?: ToastOptions | ((r: T) => ToastOptions);
      position?: Position;
    }
  ) {
    const loadingId = this.show({ ...(opts.loading || {}), type: 'loading', position: opts.position });
    p.then((res) => {
      this.dismiss(loadingId);
      if (opts.action) {
        const actionOpt = typeof opts.action === 'function' ? (opts.action as any)(res) : opts.action;
        if (actionOpt) {
          this.show({ ...(actionOpt || {}), type: 'action', position: opts.position });
          return;
        }
      }
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
