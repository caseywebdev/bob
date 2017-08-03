import config from '../config';

const {watch} = config;

if (watch) {
  const script = document.createElement('script');
  script.async = true;
  script.src = '/livereload.js?port=80';
  document.body.appendChild(script);
}
