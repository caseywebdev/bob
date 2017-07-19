const FortKnox = require('fort-knox');

const cache = new WeakMap();

module.exports = ({env: {config: {vault}}}) =>
  cache.get(vault) || cache.set(vault, new FortKnox(vault)).get(vault);
