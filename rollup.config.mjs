import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import copy from 'rollup-plugin-copy';
import replace from '@rollup/plugin-replace';

export default [
  // ESM + CJS
  {
    input: 'src/vanilla/index.ts',
    output: [
      { file: 'dist/index.esm.js', format: 'es', exports: 'named' },
      { file: 'dist/index.cjs.js', format: 'cjs', exports: 'named' }
    ],
    plugins: [
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
        preventAssignment: true
      }),
      resolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json' }),
      copy({
        targets: [
          { src: 'src/styles/sileo.css', dest: 'dist', rename: 'styles.css' }
        ],
        verbose: true
      })
    ]
  },
  // UMD build for browser (vanilla DOM use)
  {
    input: 'src/vanilla/index.ts',
    output: {
      file: 'dist/notify.umd.js',
      format: 'umd',
      exports: 'named',
      name: 'notify'
    },
    plugins: [resolve(), commonjs(), typescript({ tsconfig: './tsconfig.json' }),
      copy({
        targets: [
          { src: 'src/styles/sileo.css', dest: 'dist', rename: 'styles.css' }
        ],
        verbose: true
      })]
  }
];
