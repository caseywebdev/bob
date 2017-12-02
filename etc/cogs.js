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
    {name: 'autoprefixer', only: '**/*.css'},
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
      only: 'src/**/*.js',
      options: {presets: ['es2015', 'stage-0', 'react']}
    },
    {
      name: 'concat-commonjs',
      only: '**/*.js',
      options: {entry: 'src/client/index.js'}
    },
    MINIFY ? [
      {name: 'clean-css', only: '**/*.+(scss|css)'},
      {
        name: 'uglify-js',
        only: '**/*.js',
        except: '**/*+(-|_|.)min.js'
      }
    ] : []
  ),
  builds: {
    'node_modules/font-awesome/fonts/*': {dir: 'build/fonts'},
    'src/client/public/**/*': {dir: 'build'},
    ...(ONLY_STATIC ? {} : {
      'src/client/index.scss': 'build/index.css',
      'src/client/index.js': 'build/index.js'
    })
  }
};
