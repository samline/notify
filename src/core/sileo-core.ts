// Lógica agnóstica de Sileo (sin dependencias de React)
// Permite gestión de toasts y utilidades para VanillaJS, Vue, Svelte, etc.

export type SileoState =
  | "success"
  | "loading"
  | "error"
  | "warning"
  | "info"
  | "action";

export interface SileoStyles {
  title?: string;
  description?: string;
  badge?: string;
  button?: string;
}

export interface SileoButton {
  title: string;
  onClick: () => void;
}

export const SILEO_POSITIONS = [
  "top-left",
  "top-center",
  "top-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
] as const;

export type SileoPosition = (typeof SILEO_POSITIONS)[number];

export interface SileoOptions {
  title?: string;
  description?: string;
  type?: SileoState;
  position?: SileoPosition;
  duration?: number | null;
  icon?: any;
  styles?: SileoStyles;
  fill?: string;
  roundness?: number;
  autopilot?: boolean | { expand?: number; collapse?: number };
  button?: SileoButton;
}

export interface SileoItem extends SileoOptions {
  id: string;
  instanceId: string;
  exiting?: boolean;
  autoExpandDelayMs?: number;
  autoCollapseDelayMs?: number;
}

type SileoListener = (toasts: SileoItem[]) => void;

export class SileoCore {
  private toasts: SileoItem[] = [];
  private listeners: Set<SileoListener> = new Set();
  private position: SileoPosition = "top-right";
  private options: Partial<SileoOptions> | undefined = undefined;
  private idCounter = 0;

  private generateId() {
    return `${++this.idCounter}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  subscribe(fn: SileoListener) {
    this.listeners.add(fn);
    fn(this.toasts);
    return () => this.listeners.delete(fn);
  }

  private emit() {
    for (const fn of this.listeners) fn(this.toasts);
  }

  private update(fn: (prev: SileoItem[]) => SileoItem[]) {
    this.toasts = fn(this.toasts);
    this.emit();
  }

  dismiss(id: string) {
    const item = this.toasts.find((t) => t.id === id);
    if (!item || item.exiting) return;
    this.update((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    setTimeout(() => this.update((prev) => prev.filter((t) => t.id !== id)), 600);
  }

  show(opts: SileoOptions) {
    const id = opts.id ?? "sileo-default";
    const instanceId = this.generateId();
    const item: SileoItem = {
      ...opts,
      id,
      instanceId,
      state: opts.type ?? "success",
    } as SileoItem;
    this.update((prev) => [...prev.filter((t) => t.id !== id), item]);
    return id;
  }

  getToasts() {
    return this.toasts;
  }
}

// Instancia global para uso multiplataforma
export const sileoCore = new SileoCore();
