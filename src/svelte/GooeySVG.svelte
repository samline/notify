<!-- SVG Gooey Filter para animaciones morphing estilo Sileo (Svelte) -->
<script lang="ts">
  import { onMount } from 'svelte';
  onMount(() => {
    if (!document.getElementById('sileo-gooey-svg')) {
      const div = document.createElement('div');
      div.id = 'sileo-gooey-svg';
      div.style.position = 'absolute';
      div.style.width = '0';
      div.style.height = '0';
      div.innerHTML = `<svg width="0" height="0" style="position:absolute"><filter id="sileo-gooey"><feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" /><feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 30 -14" result="goo" /><feComponentTransfer in="goo" result="thresholded"><feFuncA type="table" tableValues="0 1" /></feComponentTransfer><feBlend in="SourceGraphic" in2="thresholded" mode="normal" /></filter></svg>`;
      document.body.appendChild(div);
    }
  });
</script>
