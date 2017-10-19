const {consul: {url}} = require('../config');
const fetch = require('node-fetch');

module.exports = async ({key, path}) => {
  const res = await fetch(`${url}/v1/kv/${path}?raw`);
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch (er) { return text; }

  return key ? json[key] : json;
};
