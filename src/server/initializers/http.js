const {execute, subscribe} = require('graphql');
const {promisify} = require('util');
const {SubscriptionServer} = require('subscriptions-transport-ws');
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const getSchemaContext = require('../functions/get-schema-context');
const http = require('http');
const schema = require('../schema');

const NOT_FOUND = Object.assign(new Error('Not Found'), {statusCode: 404});

const asyncify = handler =>
  Array.isArray(handler) ? handler.map(asyncify) :
  async (req, res, next) => {
    try { await handler({next, req, res}); } catch (er) { next(er); }
  };

const server = http.createServer(
  express()
    .enable('case sensitive routing')
    .enable('strict routing')
    .disable('x-powered-by')
    .use(cors())
    .use(bodyParser.json())
    .get('/healthz', asyncify(require('../handlers/healthz')))
    .post('/graphql', asyncify(require('../handlers/graphql')))
    .post('/webhook', asyncify(require('../handlers/webhook')))
    .use((req, res, next) => next(NOT_FOUND))
    .use(require('../handlers/error'))
);

SubscriptionServer.create(
  {
    execute,
    onConnect: async ({authorization}, {upgradeReq: req}) =>
      await getSchemaContext({authorization, req}),
    schema,
    subscribe
  },
  {path: '/graphql', server}
);

const sockets = new Set();
server.on('connection', socket => {
  sockets.add(socket);
  socket.on('close', () => sockets.delete(socket));
});

process.once('SIGTERM', () => {
  console.log(`Closing HTTP server (${sockets.size} open sockets)...`);
  sockets.forEach(socket => socket.destroy());
  server.close(() => console.log('HTTP server closed'));
});

module.exports = async () => {
  console.log('Starting HTTP server...');
  await promisify(server.listen.bind(server, 8080))();
  console.log('HTTP server started');
};
