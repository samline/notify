import { defineComponent, h, onBeforeUnmount, onMounted, watch } from 'vue';
import type { PropType, Plugin } from 'vue';

import { createToaster, destroyToaster, getToaster, toast } from '../index';
import type { CommonToasterOptions } from '../core';
import type { Position } from '../types';

const toasterProps = {
  id: String,
  theme: String as PropType<CommonToasterOptions['theme']>,
  position: String as PropType<Position>,
  expand: Boolean,
  duration: Number,
  gap: Number,
  visibleToasts: Number,
  closeButton: Boolean,
  className: String,
  offset: [Object, String, Number] as PropType<CommonToasterOptions['offset']>,
  mobileOffset: [Object, String, Number] as PropType<CommonToasterOptions['mobileOffset']>,
  dir: String as PropType<CommonToasterOptions['dir']>,
  richColors: Boolean,
  customAriaLabel: String,
  containerAriaLabel: String,
};

function cleanOptions(options: Record<string, unknown>): CommonToasterOptions {
  const nextOptions: Record<string, unknown> = {};

  for (const key in options) {
    if (Object.prototype.hasOwnProperty.call(options, key) && options[key] !== undefined) {
      nextOptions[key] = options[key];
    }
  }

  return nextOptions as CommonToasterOptions;
}

export const Toaster = defineComponent({
  name: 'NotifyToaster',
  props: toasterProps,
  setup(props) {
    let mounted = false;

    const sync = () => {
      const options = cleanOptions({
        id: props.id,
        theme: props.theme,
        position: props.position,
        expand: props.expand,
        duration: props.duration,
        gap: props.gap,
        visibleToasts: props.visibleToasts,
        closeButton: props.closeButton,
        className: props.className,
        offset: props.offset,
        mobileOffset: props.mobileOffset,
        dir: props.dir,
        richColors: props.richColors,
        customAriaLabel: props.customAriaLabel,
        containerAriaLabel: props.containerAriaLabel,
      });

      createToaster(options);
    };

    onMounted(() => {
      mounted = true;
      sync();
    });

    watch(
      () => ({ ...props }),
      () => {
        if (!mounted) return;
        sync();
      },
      { deep: true },
    );

    onBeforeUnmount(() => {
      destroyToaster();
      mounted = false;
    });

    return () => h('span', { 'data-notify-vue-toaster': '', hidden: true, 'aria-hidden': 'true' });
  },
});

export const NotifyPlugin: Plugin = {
  install(app) {
    app.component('NotifyToaster', Toaster);
    app.config.globalProperties.$toast = toast;
    app.provide('notify:toast', toast);
  },
};

export { createToaster, destroyToaster, getToaster, toast };
export type { CommonToasterOptions };