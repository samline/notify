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
      // Inyectar SVG gooey filter solo una vez
      if (!document.getElementById('sileo-gooey-svg')) {
        const div = document.createElement('div');
        div.id = 'sileo-gooey-svg';
        div.style.position = 'absolute';
        div.style.width = '0';
        div.style.height = '0';
        div.innerHTML = `<svg width="0" height="0" style="position:absolute"><filter id="sileo-gooey"><feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" /><feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" /><feBlend in="SourceGraphic" in2="goo" /></filter></svg>`;
        document.body.appendChild(div);
      }
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
    }, toasts.value.map((t) => {
      // Badge SVG animado y soporte para fill, roundness, icono por tipo
      let badgeIcon;
      if (t.options.icon) {
        badgeIcon = typeof t.options.icon === 'string'
          ? h('span', { innerHTML: t.options.icon })
          : t.options.icon;
      } else {
        const type = t.options.type || 'info';
        badgeIcon = {
          success: h('svg', { width: 20, height: 20, fill: 'none', viewBox: '0 0 20 20' }, [h('circle', { cx: 10, cy: 10, r: 10, fill: '#16a34a' }), h('path', { d: 'M6 10.5l2.5 2.5 5-5', stroke: '#fff', 'stroke-width': 1.5, 'stroke-linecap': 'round' })]),
          error: h('svg', { width: 20, height: 20, fill: 'none', viewBox: '0 0 20 20' }, [h('circle', { cx: 10, cy: 10, r: 10, fill: '#ef4444' }), h('path', { d: 'M7 7l6 6M13 7l-6 6', stroke: '#fff', 'stroke-width': 1.5, 'stroke-linecap': 'round' })]),
          info: h('svg', { width: 20, height: 20, fill: 'none', viewBox: '0 0 20 20' }, [h('circle', { cx: 10, cy: 10, r: 10, fill: '#2563eb' }), h('text', { x: 10, y: 15, 'text-anchor': 'middle', 'font-size': 12, fill: '#fff' }, 'i')]),
          warning: h('svg', { width: 20, height: 20, fill: 'none', viewBox: '0 0 20 20' }, [h('circle', { cx: 10, cy: 10, r: 10, fill: '#f59e0b' }), h('path', { d: 'M10 6v4m0 3h.01', stroke: '#fff', 'stroke-width': 1.5, 'stroke-linecap': 'round' })]),
          action: h('svg', { width: 20, height: 20, fill: 'none', viewBox: '0 0 20 20' }, [h('circle', { cx: 10, cy: 10, r: 10, fill: '#6366f1' }), h('path', { d: 'M7 10h6', stroke: '#fff', 'stroke-width': 1.5, 'stroke-linecap': 'round' })]),
          loading: h('svg', { width: 20, height: 20, fill: 'none', viewBox: '0 0 20 20' }, [h('circle', { cx: 10, cy: 10, r: 8, stroke: '#fff', 'stroke-width': 3, opacity: '.3' }), h('path', { d: 'M18 10a8 8 0 1 1-8-8', stroke: '#fff', 'stroke-width': 3 })]),
        }[type];
      }
      return h('div', {
        key: t.id,
        class: 'sileo-toast',
        'data-type': t.options.type,
        'data-id': t.id,
        style: {
          ...(t.options.fill ? { background: t.options.fill } : {}),
          ...(t.options.roundness ? { borderRadius: t.options.roundness + 'px', '--sileo-roundness': t.options.roundness + 'px' } : {}),
          filter: 'url(#sileo-gooey)'
        }
      }, [
        h('span', {
          class: t.options.styles?.badge ? `sileo-toast-badge ${t.options.styles.badge}` : 'sileo-toast-badge',
          'data-sileo-badge': ''
        }, [badgeIcon]),
        h('div', { style: { flex: '1' } }, [
          h('div', { class: t.options.styles?.title ? `sileo-toast-header ${t.options.styles.title}` : 'sileo-toast-header' }, t.options.title),
          t.options.description ? h('div', { class: t.options.styles?.description ? `sileo-toast-desc ${t.options.styles.description}` : 'sileo-toast-desc' }, t.options.description) : null
        ]),
        t.options.button ? h('button', {
          class: t.options.styles?.button ? `sileo-toast-btn ${t.options.styles.button}` : 'sileo-toast-btn',
          onClick: (e: Event) => { e.stopPropagation(); t.options.button!.onClick(); handleDismiss(t.id); }
        }, t.options.button.title) : null,
        h('button', { class: 'sileo-toast-close', onClick: () => handleDismiss(t.id) }, '\u00d7')
      ]);
    }));
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
