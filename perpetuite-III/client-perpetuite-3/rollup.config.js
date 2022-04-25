/*----------------------------------------*\
  easyPlayer - rollup.config.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-04-04 22:22:15
  @Last Modified time: 2022-04-05 00:33:24
\*----------------------------------------*/
import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: './src/index.js',
  output: {
  	file: './tmp/bundle.js',
    format: 'cjs'
  },
  plugins: [
    babel({babelHelpers: 'bundled'}),
    resolve(),
    commonjs(),
  ]
};