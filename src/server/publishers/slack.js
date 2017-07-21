const _ = require('underscore');
const {WebClient} = require('@slack/client');
const getDb = require('../utils/get-db');
const getVault = require('../utils/get-vault');
const STATUS_INFO = require('../../shared/constants/status-info');

const getToken = async ({
  env,
  env: {config: {slack: {token: {value, vault: {path, key} = {}}}}}
}) => value || (await getVault({env}).get(path))[key];

const getChannel = async ({
  build: {meta},
  client,
  env: {config: {slack: {channel: defaultChannel}}}
}) => {
  let {channel} = ((meta || {}).slack || {});
  if (!channel) channel = defaultChannel;
  if (!channel) return;

  if (!channel.startsWith('#')) return channel;

  const {channels} = await client.channels.list();
  return (_.find(channels, {name: channel.slice(1)}) || {}).id;
};

module.exports = async ({
  build,
  build: {error, id, ref, repo, sha, tags, status, meta},
  env,
  env: {config: {slack}},
  url
}) => {
  if (!slack) return;

  const client = new WebClient(await getToken({env}));
  const channel = await getChannel({build, client, env});
  if (!channel) return;

  if (!meta) meta = {};
  if (!meta.slack) meta = _.extend({}, meta, {slack: {}});
  let {ts} = meta.slack;
  const {iconEmoji, iconUrl, username} = slack;
  const {color, emojiShortname} = STATUS_INFO[status];
  const title = `:${emojiShortname}: ${repo}#${ref} ${status}`;
  const options = {
    attachments: [{
      color,
      fallback: title,
      title,
      title_link: url,
      fields: [].concat(
        {title: 'SHA', value: sha},
        {title: 'Tags', value: tags.join('\n')},
        error ? {title: 'Error', value: error} : []
      )
    }],
    icon_emoji: iconEmoji,
    icon_url: iconUrl,
    parse: 'none',
    username
  };
  if (ts) return client.chat.update(ts, channel, null, options);

  ts = (await client.chat.postMessage(channel, null, options)).ts;
  meta = _.extend({}, meta, {slack: _.extend({}, meta.slack, {channel, ts})});
  const db = await getDb();
  return db('builds').update({meta}).where({id});
};
