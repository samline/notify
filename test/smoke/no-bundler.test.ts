import { existsSync } from 'fs';
import { describe, it, expect } from 'vitest';
import { resolve } from 'path';

describe('no-bundler UMD bundle', () => {
  it('dist/notify.umd.js should exist', () => {
    const p = resolve(__dirname, '../../dist/notify.umd.js');
    expect(existsSync(p)).toBe(true);
  });
});
