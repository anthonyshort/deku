import babel from 'rollup-plugin-babel';
import npm from 'rollup-plugin-npm';
import commonjs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify';
import { argv } from 'yargs';

const format = argv.format || argv.f || 'iife';
const compress = argv.uglify;

const babelOptions = {
    presets: [
        'es2015-rollup',
        'stage-2'
    ],
    babelrc: false
};

export default {
    entry: 'src/index.js',
    format,
    plugins: [
            babel(babelOptions),
            npm({ jsnext: true }),
            commonjs()
        ].concat(compress ? uglify() : []),
    moduleName: 'deku',
    moduleId: 'deku',
    dest: 'dist/deku.js'
};
