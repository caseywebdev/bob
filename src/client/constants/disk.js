import config from '../config';
import store from 'store';

const {namespace} = config.disk;

export default store.namespace(namespace);
