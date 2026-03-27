import { App, defineComponent, h, onMounted, ref } from 'vue';
import { notify, sileo } from '../core/index';
import type { ToastItem } from '../core/index';
import { animate } from 'motion';

export const Toaster = defineComponent({
  props: { position: { type: String, default: 'top-right' } },
  setup(props) {
    const toasts = ref<ToastItem[]>([]);
    let unsub: (() => void) | null = null;
    onMounted(() => {
      unsub = sileo.subscribe((items) => { toasts.value = items.filter((t) => (t.options.position || 'top-right') === props.position); });
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
    return () => h('div', { class: 'sileo-toaster', 'data-position': props.position }, toasts.value.map((t) => h('div', { key: t.id, class: 'sileo-toast', 'data-type': t.options.type }, [
      h('div', { style: { flex: '1' } }, [
        h('div', { class: 'sileo-toast-header' }, t.options.title),
        t.options.description ? h('div', { class: 'sileo-toast-desc' }, t.options.description) : null
      ]),
      t.options.button ? h('button', { class: 'sileo-toast-btn', onClick: (e: Event) => { e.stopPropagation(); t.options.button!.onClick(); handleDismiss(t.id); } }, t.options.button.title) : null,
      h('button', { class: 'sileo-toast-close', onClick: () => handleDismiss(t.id) }, '×')
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
