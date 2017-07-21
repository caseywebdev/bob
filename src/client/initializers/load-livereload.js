import config from '../config';

const {url} = config.livereload;

if (url) {
  const script = document.createElement('script');
  script.src = `${url}/livereload.js`;
  script.async = true;
  document.body.appendChild(script);
}
