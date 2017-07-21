const _ = require('underscore');
const {promisify} = require('util');
const bodyParser = require('body-parser');
const compression = require('compression');
const express = require('express');
const http = require('http');
const Live = require('live-socket');
const path = require('path');
const ws = require('uws');
const {NOT_FOUND} = require('../../shared/constants/errors');

const asyncify = handlers =>
  _.map(_.isArray(handlers) ? handlers : [handlers], handler =>
    async (req, res, next) => {
      try { await handler(req, res, next); } catch (er) { next(er); }
    }
  );

const setHeaders = res => res.set('Cache-Control', 'no-cache, public');

const ROOT_PATH = path.resolve('build/index.html');

const server = http.createServer(
  express()
    .enable('case sensitive routing')
    .enable('strict routing')
    .disable('x-powered-by')
    .use(compression())
    .use(express.static('build', {setHeaders}))
    .use(bodyParser.json())
    .post('/api/pave', asyncify(require('../handlers/http/pave')))
    .post(
      '/api/envs/:envSlug/webhooks/:sourceId',
      asyncify(require('../handlers/http/webhook'))
    )
    .use('/api/*', (req, res, next) => next(NOT_FOUND))
    .use((req, res) => res.sendFile(ROOT_PATH))
    .use(require('../handlers/http/error'))
);

const HANDLERS = _.map(['close', 'open', 'pave'], name => {
  const handler = require(`../handlers/ws/${name}`);
  return socket =>
    socket.on(name, async (params, cb = _.noop) => {
      try { cb(await handler({params, socket})); } catch (er) { cb(er); }
    });
});

const wss = new ws.Server({server});

wss.on('connection', socket => {
  socket = new Live({socket});
  _.invoke(HANDLERS, 'call', null, socket);
  socket.trigger('open');
});

process.on('SIGTERM', () => {
  console.log('Closing HTTP server...');
  server.close(() => console.log('HTTP server closed'));
});

module.exports = async () => {
  console.log('Starting HTTP server...');
  await promisify(server.listen.bind(server, 80))();
  console.log('HTTP server started');
};
