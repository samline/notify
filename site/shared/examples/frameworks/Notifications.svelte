<script lang="ts">
  import { onMount } from 'svelte'
  import { createToaster, destroyToaster, toast } from '@samline/notify'
  import '@samline/notify/styles.css'
  onMount(() => {
    createToaster({ richColors: true, closeButton: true })
    return () => destroyToaster()
  })
</script>
<button type="button" onclick={() => toast.success('Changes saved')}>Save changes</button>
