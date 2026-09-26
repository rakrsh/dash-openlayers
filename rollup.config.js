import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';
import path from 'path';
import { babel } from '@rollup/plugin-babel';

const jsx = babel({
  babelHelpers: 'bundled',
  presets: [],
  plugins: [['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]],
  extensions: ['.js'],
  exclude: 'node_modules/**',
});

export default [
  // ESM build
  {
    input: 'src/index.js',
    output: {
      file: path.join('dash_openlayers', 'dash_openlayers.esm.js'),
      format: 'es',
      sourcemap: false,
    },
    plugins: [jsx, resolve(), commonjs(), postcss({ extract: false })],
  },
  // UMD build (minified)
  {
    input: 'src/index.js',
    output: {
      file: path.join('dash_openlayers', 'dash_openlayers.umd.js'),
      format: 'umd',
      name: 'dash_openlayers',
      sourcemap: false,
    },
    plugins: [jsx, resolve(), commonjs(), postcss({ extract: false }), terser()],
  },
];
