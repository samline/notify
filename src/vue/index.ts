import { App, defineComponent, h, onMounted, ref } from 'vue';
import { notify, sileo } from '../core/index';
import type { ToastItem } from '../core/index';
import { animate } from 'motion';

export const Toaster = defineComponent({
  props: {
    position: { type: String, default: 'top-right' },
    offset: { type: [Number, String, Object], default: 0 },
    options: { type: Object, default: () => ({}) },
    theme: { type: String, default: undefined },
  },
  setup(props) {
    const toasts = ref<ToastItem[]>([]);
    let unsub: (() => void) | null = null;
    onMounted(() => {
      unsub = sileo.subscribe((items) => { toasts.value = items.filter((t) => (t.options.position || 'top-right') === props.position); });
      if (props.options) (sileo as any)._globalOptions = props.options;
      if (props.theme) (sileo as any)._theme = props.theme;
    });
    const handleDismiss = async (id: string) => {
      const el = document.querySelector(`[data-id="${id}"]`) as HTMLElement | null;
      if (el) {
        try {
          const a = animate(el, { opacity: [1, 0], transform: ['translateY(0px)', 'translateY(-8px)'] }, { duration: 0.15 });
          await (a as any).finished;
        } catch (e) { /* ignore */ }
      }
      sileo.dismiss(id);
    };
    // animate in newly added toasts after render
    const lastIds = ref<string[]>([]);
    import('vue').then(({ nextTick }) => {
      // watch toasts and animate new ones
      const stop = (require('vue') as any).watch(toasts, async () => {
        await nextTick();
        const ids = toasts.value.map(t => t.id);
        const added = ids.filter(id => !lastIds.value.includes(id));
        added.forEach(id => {
          const el = document.querySelector(`[data-id="${id}"]`) as HTMLElement | null;
          if (el) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(-6px)';
            try { animate(el, { opacity: [0,1], transform: ['translateY(-6px)','translateY(0px)'] }, { duration: 0.22 }); } catch (e) {}
          }
        });
        lastIds.value = ids;
      }, { deep: true });
    }).catch(() => {});

    // Calcular offset CSS
    function offsetStyle() {
      const o = props.offset;
      if (typeof o === 'number' || typeof o === 'string') {
        return { margin: typeof o === 'number' ? `${o}px` : o };
      } else if (typeof o === 'object') {
        const s: any = {};
        if (o.top !== undefined) s.marginTop = `${o.top}px`;
        if (o.right !== undefined) s.marginRight = `${o.right}px`;
        if (o.bottom !== undefined) s.marginBottom = `${o.bottom}px`;
        if (o.left !== undefined) s.marginLeft = `${o.left}px`;
        return s;
      }
      return {};
    }

    return () => h('div', {
      class: 'sileo-toaster',
      'data-position': props.position,
      'data-theme': props.theme,
      style: offsetStyle()
    }, toasts.value.map((t) => h('div', { key: t.id, class: 'sileo-toast', 'data-type': t.options.type, 'data-id': t.id }, [
      t.options.icon ? h('span', {
        class: t.options.styles?.badge ? `sileo-toast-badge ${t.options.styles.badge}` : 'sileo-toast-badge',
        style: t.options.fill ? { background: t.options.fill } : {}
      }, [typeof t.options.icon === 'string' ? h('span', { innerHTML: t.options.icon }) : t.options.icon]) : null,
      h('div', { style: { flex: '1' } }, [
        h('div', { class: t.options.styles?.title ? `sileo-toast-header ${t.options.styles.title}` : 'sileo-toast-header' }, t.options.title),
        t.options.description ? h('div', { class: t.options.styles?.description ? `sileo-toast-desc ${t.options.styles.description}` : 'sileo-toast-desc' }, t.options.description) : null
      ]),
      t.options.button ? h('button', {
        class: t.options.styles?.button ? `sileo-toast-btn ${t.options.styles.button}` : 'sileo-toast-btn',
        onClick: (e: Event) => { e.stopPropagation(); t.options.button!.onClick(); handleDismiss(t.id); }
      }, t.options.button.title) : null,
      h('button', { class: 'sileo-toast-close', onClick: () => handleDismiss(t.id) }, '\u00d7')
    ])));
  }
});

export default {
  install(app: App) {
    app.config.globalProperties.$sileo = sileo;
    // expose notify as well on the app for convenience
    (app.config.globalProperties as any).$notify = notify;
    app.component('SileoToaster', Toaster as any);
  }
};
