const {env} = process;
const MINIFY = env.MINIFY === '1';
const ONLY_STATIC = env.ONLY_STATIC === '1';

const STATIC = {
  transformers: [
    {
      name: 'replace',
      only: 'src/client/public/index.html',
      options: {
        flags: 'g',
        patterns: {
          '{env.escaped.(\\w+)}': (_, key) => JSON.stringify(env[key]),
          '{env.literal.(\\w+)}': (_, key) => env[key]
        }
      }
    }
  ],
  builds: {
    'src/public/**/*': {dir: 'build'}
  }
};

const STYLES = {
  transformers: [].concat(
    {name: 'stylelint', only: 'src/**/*.scss', options: {syntax: 'scss'}},
    {name: 'directives', only: 'src/**/*.scss'},
    {name: 'sass', only: '**/*.scss'},
    'autoprefixer',
    {
      name: 'local-css',
      only: 'src/**/*.scss',
      except: 'src/global.scss',
      options: {base: 'src', debug: !MINIFY}
    },
    MINIFY ? {
      name: 'clean-css',
      only: '**/*.+(scss|css)',
      options: {processImport: false}
    } : []
  ),
  builds: {'src/index.scss': 'build/index.css'}
};

const JAVASCRIPT = {
  transformers: [].concat(
    {name: 'sass', only: '**/*.scss'},
    {
      name: 'local-css',
      only: 'src/**/*.scss',
      options: {base: 'src', debug: !MINIFY, export: true}
    },
    {name: 'json', only: '**/*.+(json|scss)'},
    {name: 'eslint', only: 'src/**/*.js'},
    {
      name: 'replace',
      only: '**/*.js',
      options: {
        flags: 'g',
        patterns: {
          'process.env.NODE_ENV': MINIFY ? "'production'" : "'development'"
        }
      }
    },
    {
      name: 'babel',
      only: [
        'src/**/*.+(js|json|scss)',
        'node_modules/entities/maps/*.json'
      ],
      options: {presets: ['es2015', 'stage-0', 'react']}
    },
    {
      name: 'concat-commonjs',
      only: '**/*.+(js|json|scss)',
      options: {
        entry: 'src/index.js',
        extensions: ['.js', '.scss']
      }
    },
    MINIFY ? {
      name: 'uglify-js',
      only: '**/*.+(js|json|scss)',
      except: ['**/*+(-|_|.)min.js', 'node_modules/ammo.js/ammo.js']
    } : []
  ),
  builds: {'src/index.js': 'build/index.js'}
};

module.exports = ONLY_STATIC ? [STATIC] : [JAVASCRIPT, STATIC, STYLES];
