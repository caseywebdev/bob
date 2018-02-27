import config from '../config';

window.global = window;
window.process = {
  env: {
    NODE_ENV: config.minify ? 'production' : 'development'
  }
};
