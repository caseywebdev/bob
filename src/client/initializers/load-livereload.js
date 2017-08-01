import config from '../config';

const {watch} = config;

if (watch) {
  const script = document.createElement('script');
  script.async = true;
  script.src = '/livereload.js';
  document.body.appendChild(script);
}
