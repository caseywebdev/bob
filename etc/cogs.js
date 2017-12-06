const {env} = process;
const MINIFY = env.MINIFY === '1';
const ONLY_STATIC = env.ONLY_STATIC === '1';

module.exports = {
  transformers: [].concat(
    {
      name: 'replace',
      only: 'src/client/public/index.html',
      options: {
        flags: 'g',
        patterns: {
          '{{env.escaped.(\\w+)}}': (_, key) => JSON.stringify(env[key]),
          '{{env.literal.(\\w+)}}': (_, key) => env[key]
        }
      }
    },
    {name: 'stylelint', only: 'src/**/*.scss', options: {syntax: 'scss'}},
    {name: 'sass', only: '**/*.scss'},
    {name: 'autoprefixer', only: '**/*.+(css|scss)'},
    {
      name: 'local-css',
      only: '**/*.scss',
      except: 'src/client/global.scss',
      options: {debug: !MINIFY}
    },
    {
      name: 'local-css',
      only: 'src/client/global.scss',
      options: {debug: !MINIFY, rename: false}
    },
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
      only: 'src/**/*.+(js|css|scss)',
      options: {presets: ['es2015', 'stage-0', 'react']}
    },
    {
      name: 'concat-commonjs',
      only: '**/*+(js|css|scss)',
      options: {
        base: 'src/client',
        entry: 'src/client/index.js',
        extensions: ['.js', '.css', '.scss']
      }
    },
    MINIFY ? {
      name: 'uglify-js',
      only: '**/*.+(js|css|scss)',
      except: '**/*+(-|_|.)min.js'
    } : []
  ),
  manifestPath: 'build/manifest.json',
  builds: {
    'node_modules/font-awesome/fonts/*': {
      base: 'node_modules/font-awesome',
      dir: 'build'
    },
    'src/client/public/**/*': {base: 'src/client/public', dir: 'build'},
    ...(ONLY_STATIC ? {} : {'src/client/index.js': 'build/index.js'})
  }
};
