https://github.com/vallezw/sonner/assets/50796600/59b95cb7-9068-4f3e-8469-0b35d9de5cf0

[Samline Sonner](https://sonner.emilkowal.ski/) is a toast package with a shared visual runtime for React, Vue, Svelte, vanilla JS and browser/CDN usage.

## Install

```bash
npm install @samline/sonner
```

## Entrypoints

- `@samline/sonner`: vanilla/browser API
- `@samline/sonner/react`: React adapter
- `@samline/sonner/vue`: Vue adapter
- `@samline/sonner/svelte`: Svelte adapter
- `@samline/sonner/browser`: browser global entry
- `@samline/sonner/styles.css`: shared styles export

## React

```tsx
import { Toaster, toast } from '@samline/sonner/react';

function App() {
  return (
    <>
      <Toaster />
      <button onClick={() => toast('Hello from React')}>Toast</button>
    </>
  );
}
```

## Vanilla

```ts
import { createToaster, toast } from '@samline/sonner';

createToaster({ position: 'bottom-right' });

document.querySelector('button')?.addEventListener('click', () => {
  toast('Hello from vanilla');
});
```

## Vue

```ts
import { createApp } from 'vue';
import { SonnerPlugin, Toaster, toast } from '@samline/sonner/vue';

const app = createApp({
  components: { Toaster },
  template: `
    <>
      <Toaster />
      <button @click="notify">Toast</button>
    </>
  `,
  methods: {
    notify() {
      toast('Hello from Vue');
    },
  },
});

app.use(SonnerPlugin);
app.mount('#app');
```

## Svelte

```svelte
<script lang="ts">
  import { toaster, toast } from '@samline/sonner/svelte';

  const options = { position: 'bottom-right' };
</script>

<span use:toaster={options} hidden aria-hidden="true"></span>
<button on:click={() => toast('Hello from Svelte')}>Toast</button>
```

## Browser CDN

```html
<script type="module">
  import '@samline/sonner/browser';

  window.Sonner.toast('Hello from the browser');
</script>
```

## Documentation

Find the full API reference in the documentation site. The shared runtime is intended to keep the same look and the same core behaviour across frameworks.
