const _ = require('underscore');
const {Router} = require('pave');

module.exports = new Router({
  maxQueryCost: 10000,
  routes: _.extend({},
    require('./all'),
    require('./auth'),
    require('./not-found')
  )
});
