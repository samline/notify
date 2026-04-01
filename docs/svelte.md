# Svelte

Use the Svelte entry when you want a simple action-based integration.

## Install

```bash
bun add @samline/notify svelte
```

## Basic usage

```svelte
<script lang="ts">
  import { toaster, toast } from '@samline/notify/svelte'

  const options = {
    position: 'bottom-right',
    richColors: true,
  }
</script>

<span use:toaster={options} hidden aria-hidden="true"></span>
<button on:click={() => toast.success('Saved')}>Toast</button>
```

## Complete example

```svelte
<script lang="ts">
  import { toaster, toast } from '@samline/notify/svelte'

  const options = {
    position: 'bottom-right',
    duration: 5000,
    closeButton: true,
    richColors: true,
  }

  async function runTask() {
    toast.loading('Running task...', { id: 'task-status' })

    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast.success('Task complete', {
      id: 'task-status',
      description: 'The loading toast was updated in place.',
    })
  }
</script>

<span use:toaster={options} hidden aria-hidden="true"></span>

<button on:click={runTask}>Run task</button>
```

## Notes

- The action mounts the shared toaster in the DOM.
- Use `mountToaster(options?)` when you want to create the toaster from code instead of a node action.
- The Svelte entry accepts the shared toaster options from [api.md](api.md).
