const {env} = process;
const path = require('path');
const url = require('url');

const {BOB_URL} = env;
const MINIFY = env.MINIFY === '1';
const ONLY_FINAL = env.ONLY_FINAL === '1';
const WATCH = env.WATCH === '1';

const BOB_HOSTNAME = url.parse(BOB_URL).hostname;

const FINAL = {
  transformers: {
    name: 'underscore-template',
    options: {data: {BOB_HOSTNAME, BOB_URL, WATCH}}
  },
  builds: {
    'etc/nginx.conf': {base: 'etc', dir: '/etc/nginx'},
    'src/client/index.html': {base: 'src/client', dir: 'dist'}
  }
};

const FULL = {
  transformers: [].concat(
    {name: 'stylelint', only: 'src/**/*.scss', options: {syntax: 'scss'}},
    {name: 'sass', only: 'src/**/*.scss'},
    {name: 'autoprefixer', only: '**/*.+(css|scss)'},
    MINIFY ? {name: 'clean-css', only: '**/*.+(css|scss)'} : [],
    {
      name: 'local-css',
      only: 'src/**/*.scss',
      except: 'src/client/global.scss',
      options: {debug: !MINIFY}
    },
    {
      name: 'local-css',
      only: ['**/*.css', 'src/client/global.scss'],
      options: {debug: !MINIFY, rename: false}
    },
    {name: 'eslint', only: 'src/**/*.js'},
    {name: 'json', only: ['**/*.json']},
    {
      name: 'babel',
      only: ['src/**/*.+(js|scss)', '**/*.+(css|json)'],
      options: {
        plugins: ['transform-runtime'],
        presets: ['env', 'stage-0', 'react']
      }
    },
    {
      name: 'concat-commonjs',
      only: '**/*+(css|js|json|scss)',
      options: {
        alias: {
          react:
            `react/cjs/react.${MINIFY ? 'production.min' : 'development'}.js`
        },
        entry: 'src/client/index.js',
        extensions: ['.js', '.css', '.scss']
      }
    },
    MINIFY ? {
      name: 'uglify-js',
      only: '**/*.+(css|js|scss)',
      except: '**/*+(-|_|.)min.js'
    } : []
  ),
  builds: {
    'node_modules/font-awesome/fonts/*': {
      base: 'node_modules/font-awesome',
      dir: 'dist'
    },
    'src/client/public/**/*': {base: 'src/client/public', dir: 'dist'},
    'src/client/index.js': {base: 'src/client', dir: 'dist'}
  },
  manifestPath: 'dist/manifest.json',
  then: FINAL
};

module.exports = ONLY_FINAL ? FINAL : FULL;
