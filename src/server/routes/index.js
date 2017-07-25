const _ = require('underscore');
const {Router} = require('pave');

module.exports = new Router({
  maxQueryCost: 10000,
  routes: _.extend({},
    require('./auth'),
    require('./builds'),
    require('./envs'),
    require('./not-found')
  )
});
