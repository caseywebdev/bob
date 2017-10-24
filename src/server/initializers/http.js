const _ = require('underscore');
const {NOT_FOUND} = require('../../shared/constants/errors');
const {promisify} = require('util');
const bodyParser = require('body-parser');
const express = require('express');
const http = require('http');
const sockets = require('../functions/sockets');
const schema = require('../schema');
const {graphqlExpress, graphiqlExpress} = require('graphql-server-express');

const asyncify = handlers =>
  _.map(_.isArray(handlers) ? handlers : [handlers], handler =>
    async (req, res, next) => {
      try { await handler({next, req, res}); } catch (er) { next(er); }
    }
  );

const server = http.createServer(
  express()
    .enable('case sensitive routing')
    .enable('strict routing')
    .disable('x-powered-by')
    .use(bodyParser.json())
    .use('/api/graphql', graphqlExpress({schema}))
    .use('/api/graphiql', graphiqlExpress({endpointURL: '/api/graphql'}))
    .post(
      '/api/envs/:envId/webhooks/:sourceId',
      asyncify(require('../handlers/http/webhook'))
    )
    .use((req, res, next) => next(NOT_FOUND))
    .use(require('../handlers/http/error'))
);

// const HANDLERS = _.map(['close', 'open', 'pave'], name => {
//   const handler = require(`../handlers/ws/${name}`);
//   return socket =>
//     socket.live.on(name, async (params, cb = _.noop) => {
//       try { cb(null, await handler({params, socket})); } catch (er) { cb(er); }
//     });
// });
//
// const wss = new ws.Server({server});
//
// wss.on('connection', socket => {
//   socket = {live: new Live({socket})};
//   _.each(HANDLERS, handler => handler(socket));
//   socket.live.trigger('open');
// });

process.once('SIGTERM', () => {
  console.log('Closing HTTP server...');
  server.close(() => {
    console.log('HTTP server closed');
    console.log('Closing sockets...');
    _.each(sockets, ({live}) => live.close());
  });
});

module.exports = async () => {
  console.log('Starting HTTP server...');
  await promisify(server.listen.bind(server, 8080))();
  console.log('HTTP server started');
};
