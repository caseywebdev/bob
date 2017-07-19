const _ = require('underscore');
const {promisify} = require('util');
const bodyParser = require('body-parser');
const compression = require('compression');
const express = require('express');

const NOT_FOUND = _.extend(new Error(), {status: 404});

const asyncify = handlers =>
  _.map(_.isArray(handlers) ? handlers : [handlers], handler =>
    async (req, res, next) => {
      try { await handler(req, res, next); } catch (er) { next(er); }
    }
  );

const setHeaders = res => res.set('Cache-Control', 'no-cache, public');

const server = express()
  .enable('case sensitive routing')
  .enable('strict routing')
  .disable('x-powered-by')
  .use(compression())
  .use(express.static('build', {setHeaders}))
  .use(bodyParser.json())
  .post('/api/pave', asyncify(require('../handlers/pave')))
  .post(
    '/api/envs/:envSlug/webhooks/:sourceId',
    asyncify(require('../handlers/webhook'))
  )
  .use((req, res, next) => next(NOT_FOUND))
  .use(require('../handlers/error'));

module.exports = promisify(server.listen.bind(server, 80));
