import { readFileSync, existsSync } from 'fs';
import { describe, it, expect } from 'vitest';
import { resolve } from 'path';

describe('svelte toaster smoke', () => {
  it('src/svelte/Toaster.svelte contains use:animateIn or motion import', () => {
    const p = resolve(__dirname, '../../src/svelte/Toaster.svelte');
    expect(existsSync(p)).toBe(true);
    const txt = readFileSync(p, 'utf-8');
    expect(/use:animateIn|from\s+['"]motion['"]/.test(txt)).toBe(true);
  });
});
