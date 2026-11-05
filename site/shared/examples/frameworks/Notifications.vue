<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { createToaster, destroyToaster, toast } from '@samline/notify'
import '@samline/notify/styles.css'
onMounted(() => {
  createToaster({ richColors: true, closeButton: true })
})
onUnmounted(() => destroyToaster())
</script>
<template>
  <button type="button" @click="toast.success('Changes saved')">Save changes</button>
</template>
