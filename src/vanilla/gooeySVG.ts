// SVG Gooey Filter para animaciones morphing estilo Sileo
export const gooeySVG = `<svg width="0" height="0" style="position:absolute">
  <filter id="sileo-gooey">
    <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
    <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
    <feBlend in="SourceGraphic" in2="goo" />
  </filter>
</svg>`;
