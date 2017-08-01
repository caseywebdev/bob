import Live from 'live-socket';

const url = `${location.origin.replace('http', 'ws')}/api`;
export default new Live({url});
