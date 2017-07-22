import {Store, Router} from 'pave';
import disk from './disk';
import live from './live';

const send = (name, data) =>
  new Promise((resolve, reject) =>
    live.send(name, data, (er, res) => er ? reject(er) : resolve(res))
  );

const store = new Store({
  batchDelay: 1,
  router: new Router({
    routes: {
      'ui.*': () => {},

      '*': ({query}) => send('pave', {auth: disk.get('auth'), query})
    }
  })
});

export default store;
