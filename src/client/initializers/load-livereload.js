import config from '../config';

const {url} = config.livereload;

if (url) {
  const script = document.createElement('script');
  script.async = true;
  script.src = `${url}/livereload.js`;
  document.body.appendChild(script);
}
