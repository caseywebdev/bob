const _ = require('underscore');
const notify = require('../utils/notify');

module.exports = async ({build: {id}}) => {
  const data = {table: 'builds', where: {id}};
  return Promise.all(_.map(['build', `build:${id}`], channel =>
    notify({channel, data})
  ));
};
