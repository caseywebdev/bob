const _ = require('underscore');
const config = require('../config');
const Docker = require('dockerode');
const vault = require('./root-vault');
const memoize = require('./memoize');

const {docker} = config;

const compact = obj => {
  obj = _.pick(obj, value => _.isObject(value) ? compact(value) : value);
  if (!_.isEmpty(obj)) return obj;
};

const normalize = async options => {
  options = compact(options);
  for (let key in options) {
    let value = options[key];
    if (!_.isObject(value)) continue;

    if (value.value) options[key] = value.value;
    else options[key] = (await vault.get(value.vault.path))[value.vault.key];
  }
  return options;
};

module.exports = memoize(async () => new Docker(await normalize(docker)));
